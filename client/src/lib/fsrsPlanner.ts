import type { Flashcard } from '../types/flashcard'
import type {
  ExamPlan,
  ExamPlanForecast,
  ExamPlanSchedule,
  PlanCalendarDay,
  PlanCalendarWeek,
  PlanDayEntry,
  PlanDayStatus,
  ReadinessPoint,
} from '../types/examPlan'
import type { Module } from '../types/module'
import { buildTodaySession } from './reviewQueue'
import {
  cloneFsrsCard,
  createDefaultSrs,
  DAILY_NEW_CARD_LIMIT,
  endOfDay,
  fsrs,
  getRetrievability,
  isNewCard,
  startOfDay,
  TARGET_RETENTION,
  toFsrsCard,
} from './fsrsEngine'
import { Rating, State, type Card } from 'ts-fsrs'

const DAY_MS = 24 * 60 * 60 * 1000

export function toDateKey(date: Date | number = Date.now()): string {
  const d = typeof date === 'number' ? new Date(date) : date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`)
}

/** Если экзамен «раньше» даты создания плана (типичный баг: апрель без года), сдвигаем на следующий год */
export function normalizeExamDateForPlan(examDate: string, planCreatedAt: number): string {
  const exam = parseDateKey(examDate)
  const created = parseDateKey(toDateKey(planCreatedAt))
  if (exam > created) return examDate

  const adjusted = new Date(exam)
  do {
    adjusted.setFullYear(adjusted.getFullYear() + 1)
  } while (adjusted <= created)

  return toDateKey(adjusted)
}

export function enumerateDateKeys(from: string, to: string): string[] {
  const keys: string[] = []
  const cursor = parseDateKey(from)
  const end = parseDateKey(to)
  while (cursor <= end) {
    keys.push(toDateKey(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return keys
}

export function daysBetween(from: Date, to: Date): number {
  const start = startOfDay(from)
  const end = startOfDay(to)
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / DAY_MS))
}

interface SimCard {
  cardId: string
  moduleId: string
  fsrs: Card
}

interface ModuleInfo {
  id: string
  title: string
}

function resolvePastStatus(planned: number, actual: number): PlanDayStatus {
  if (planned === 0) return actual > 0 ? 'past-done' : 'past-missed'
  if (actual >= planned) return 'past-done'
  if (actual > 0) return 'past-partial'
  return 'past-missed'
}

function pluralizeCardsShort(count: number): string {
  const abs = Math.abs(count)
  const mod100 = abs % 100
  const mod10 = abs % 10
  if (mod100 >= 11 && mod100 <= 14) return 'карточек'
  if (mod10 === 1) return 'карточка'
  if (mod10 >= 2 && mod10 <= 4) return 'карточки'
  return 'карточек'
}

function getDueSimCards(sim: SimCard[], dayEnd: Date): SimCard[] {
  const ts = dayEnd.getTime()
  return sim.filter((s) => s.fsrs.state !== State.New && s.fsrs.due.getTime() <= ts)
}

function applySimReviews(sim: SimCard[], due: SimCard[], at: Date, count: number) {
  const toReview = due.slice(0, count)
  for (const item of toReview) {
    const idx = sim.indexOf(item)
    sim[idx].fsrs = fsrs.next(item.fsrs, at, Rating.Good).card
  }
}

function applySimNew(sim: SimCard[], newItems: SimCard[], at: Date, count: number) {
  let introduced = 0
  for (const item of newItems) {
    if (introduced >= count) break
    if (item.fsrs.state !== State.New) continue
    const idx = sim.indexOf(item)
    sim[idx].fsrs = fsrs.next(item.fsrs, at, Rating.Good).card
    introduced += 1
  }
}

function computeReadinessAt(sim: SimCard[], at: Date, totalCards: number): number {
  if (totalCards === 0) return 100
  let sum = 0
  for (const s of sim) {
    if (s.fsrs.state === State.New) continue
    sum += fsrs.get_retrievability(s.fsrs, at, false)
  }
  return Math.round((sum / totalCards) * 100)
}

function buildModuleBreakdown(
  due: SimCard[],
  newCount: number,
  newQueue: SimCard[],
  modules: Map<string, ModuleInfo>,
): PlanDayEntry['moduleBreakdown'] {
  const counts = new Map<string, { new: number; reviews: number }>()

  for (const item of due) {
    const cur = counts.get(item.moduleId) ?? { new: 0, reviews: 0 }
    cur.reviews += 1
    counts.set(item.moduleId, cur)
  }

  let added = 0
  for (const item of newQueue) {
    if (added >= newCount) break
    if (item.fsrs.state !== State.New) continue
    const cur = counts.get(item.moduleId) ?? { new: 0, reviews: 0 }
    cur.new += 1
    counts.set(item.moduleId, cur)
    added += 1
  }

  return [...counts.entries()].map(([moduleId, c]) => ({
    moduleId,
    title: modules.get(moduleId)?.title ?? moduleId,
    new: c.new,
    reviews: c.reviews,
  }))
}

export function buildExamPlanSchedule(
  plan: ExamPlan,
  cardsByModule: Record<string, Flashcard[]>,
  modules: Module[],
  now = Date.now(),
): ExamPlanSchedule {
  const moduleMap = new Map(modules.map((m) => [m.id, { id: m.id, title: m.title }]))
  const allCards = plan.moduleIds.flatMap((id) => cardsByModule[id] ?? [])

  const sim: SimCard[] = []
  for (const modId of plan.moduleIds) {
    for (const card of cardsByModule[modId] ?? []) {
      sim.push({
        cardId: card.id,
        moduleId: modId,
        fsrs: cloneFsrsCard(toFsrsCard(card.srs, now)),
      })
    }
  }

  const totalCards = allCards.length
  const todayKey = toDateKey(now)
  const examKey = normalizeExamDateForPlan(plan.examDate, plan.createdAt)
  const planStartKey = toDateKey(plan.createdAt)
  const scheduleFromKey = planStartKey
  const studyDayKeys = enumerateDateKeys(scheduleFromKey, examKey).filter((k) => k < examKey)
  const daysRemaining = daysBetween(parseDateKey(todayKey), parseDateKey(examKey))

  const newQueue = sim.filter((s) => s.fsrs.state === State.New)
  const baseNewPerDay = Math.min(
    DAILY_NEW_CARD_LIMIT,
    daysRemaining > 0 ? Math.ceil(newQueue.length / daysRemaining) : newQueue.length,
  )

  let reviewBacklog = 0
  let newBacklog = 0
  const entries: PlanDayEntry[] = []
  const readinessCurve: ReadinessPoint[] = []

  const currentReadiness = computeReadinessAt(sim, new Date(now), totalCards)
  readinessCurve.push({ date: todayKey, percent: currentReadiness, isAdjusted: false })

  for (const dateKey of studyDayKeys) {
    const isPast = dateKey < todayKey
    const isToday = dateKey === todayKey
    const dayStart = startOfDay(parseDateKey(dateKey))
    const dayEnd = endOfDay(parseDateKey(dateKey))

    const dueCards = getDueSimCards(sim, dayEnd)
    const fsrsReviews = dueCards.length + reviewBacklog
    const fsrsNew = Math.min(baseNewPerDay + newBacklog, newQueue.filter((s) => s.fsrs.state === State.New).length)

    const plannedReviews = fsrsReviews
    const plannedNew = fsrsNew
    const totalPlanned = plannedReviews + plannedNew

    const actualReviews = plan.dailyReviews[dateKey] ?? 0
    const actualNew = plan.dailyNewCards[dateKey] ?? 0
    const totalActual = actualReviews + actualNew

    let status: PlanDayStatus = isToday ? 'today' : isPast ? resolvePastStatus(totalPlanned, totalActual) : 'future'

    const moduleBreakdown = buildModuleBreakdown(
      dueCards,
      plannedNew,
      newQueue,
      moduleMap,
    )

    if (isPast) {
      const reviewShortfall = Math.max(0, plannedReviews - actualReviews)
      const newShortfall = Math.max(0, plannedNew - actualNew)
      reviewBacklog += reviewShortfall
      newBacklog += newShortfall
      applySimReviews(sim, dueCards, dayEnd, actualReviews)
      applySimNew(sim, newQueue, dayStart, actualNew)
    } else {
      applySimReviews(sim, dueCards, dayEnd, plannedReviews)
      applySimNew(sim, newQueue, dayStart, plannedNew)
      reviewBacklog = 0
      newBacklog = 0
    }

    const readinessPercent = computeReadinessAt(sim, dayEnd, totalCards)

    entries.push({
      date: dateKey,
      plannedNew,
      plannedReviews,
      actualNew,
      actualReviews,
      totalPlanned,
      totalActual,
      status,
      isOverloaded: (reviewBacklog > 0 || newBacklog > 0) && !isPast,
      readinessPercent,
      moduleBreakdown,
    })

    if (!isPast) {
      readinessCurve.push({ date: dateKey, percent: readinessPercent, isAdjusted: false })
    }
  }

  if (examKey >= todayKey) {
    entries.push({
      date: examKey,
      plannedNew: 0,
      plannedReviews: 0,
      actualNew: 0,
      actualReviews: 0,
      totalPlanned: 0,
      totalActual: 0,
      status: 'exam',
      isOverloaded: false,
      readinessPercent: computeReadinessAt(sim, endOfDay(parseDateKey(examKey)), totalCards),
    })
  }

  const daysWithCarryover = applyCarryover(entries)
  let todayEntry = daysWithCarryover.find((d) => d.status === 'today') ?? null

  const planModules = modules.filter((m) => plan.moduleIds.includes(m.id))
  const todaySession = buildTodaySession(planModules, cardsByModule, {
    plan,
    todayEntry,
    now,
  })

  if (todayEntry) {
    const carry = todayEntry.carryoverFromYesterday ?? 0
    todayEntry = {
      ...todayEntry,
      plannedReviews: todaySession.reviewCount + carry,
      plannedNew: todaySession.newCount,
      totalPlanned: todaySession.reviewCount + carry + todaySession.newCount,
    }
    const idx = daysWithCarryover.findIndex((d) => d.status === 'today')
    if (idx >= 0) daysWithCarryover[idx] = todayEntry
  }

  const finalTodayLoad = todaySession.totalDue + (todayEntry?.carryoverFromYesterday ?? 0)

  const examInstant = endOfDay(parseDateKey(examKey))
  const predictedReadiness = computeReadinessAt(sim, examInstant, totalCards)

  const masteredCards = allCards.filter((c) => getRetrievability(c, now) >= TARGET_RETENTION).length
  let behindMessage: string | undefined
  let extraCardsPerDay: number | undefined
  let isBehindSchedule = false
  let daysBehind = 0

  const missedPast = daysWithCarryover.filter((d) => d.status === 'past-missed' || d.status === 'past-partial').length
  daysBehind = missedPast

  const todayDone = (plan.dailyReviews[todayKey] ?? 0) + (plan.dailyNewCards[todayKey] ?? 0)
  if (todayDone < finalTodayLoad && finalTodayLoad > 0) {
    extraCardsPerDay = finalTodayLoad - todayDone
    isBehindSchedule = true
    daysBehind = Math.max(daysBehind, 1)
    behindMessage = formatBehindMessage(daysBehind, extraCardsPerDay, predictedReadiness)
  } else if (reviewBacklog > 0 || newBacklog > 0) {
    isBehindSchedule = true
    extraCardsPerDay = reviewBacklog + newBacklog
    behindMessage = formatBehindMessage(Math.max(daysBehind, 1), extraCardsPerDay, predictedReadiness)
  }

  const forecast: ExamPlanForecast = {
    predictedReadinessPercent: predictedReadiness,
    currentReadinessPercent: currentReadiness,
    targetReadinessPercent: Math.round(TARGET_RETENTION * 100),
    daysRemaining,
    totalCards,
    masteredCards,
    dueToday: todaySession.reviewCount,
    newRemaining: allCards.filter(isNewCard).length,
    dailyPlan: {
      newCardsPerDay: todaySession.newCount,
      reviewsPerDay: todaySession.reviewCount,
    },
    isBehindSchedule,
    behindMessage,
    extraCardsPerDay,
    daysBehind: daysBehind > 0 ? daysBehind : undefined,
    todayLoad: finalTodayLoad,
  }

  if (daysWithCarryover.some((d) => d.status === 'exam')) {
    readinessCurve.push({
      date: examKey,
      percent: predictedReadiness,
      isAdjusted: isBehindSchedule,
    })
  }

  const weeks = buildPlanCalendarWeeks(daysWithCarryover, todayKey, examKey)

  return {
    days: daysWithCarryover,
    todayEntry,
    todayLoad: finalTodayLoad,
    forecast,
    readinessCurve,
    weeks,
    calendarFrom: todayKey,
    calendarTo: examKey,
  }
}

function applyCarryover(entries: PlanDayEntry[]): PlanDayEntry[] {
  return entries.map((entry, index) => {
    if (entry.status !== 'today' || index === 0) return entry
    const prev = entries[index - 1]
    if (prev.status === 'past-missed' || prev.status === 'past-partial') {
      const shortfall = Math.max(0, prev.totalPlanned - prev.totalActual)
      if (shortfall > 0) {
        return {
          ...entry,
          carryoverFromYesterday: shortfall,
          plannedReviews: entry.plannedReviews + shortfall,
          totalPlanned: entry.totalPlanned + shortfall,
        }
      }
    }
    return entry
  })
}

function formatBehindMessage(daysBehind: number, extraPerDay: number, readiness: number): string {
  const dayWord =
    daysBehind === 1 ? '1 день' : daysBehind < 5 ? `${daysBehind} дня` : `${daysBehind} дней`
  return `Отстаёшь от плана на ${dayWord} — чтобы успеть к цели, нужно +${extraPerDay} ${pluralizeCardsShort(extraPerDay)} в день (прогноз ${readiness}%)`
}

export function listCalendarMonths(fromKey: string, toKey: string): { year: number; month: number }[] {
  let from = fromKey
  let to = toKey
  if (parseDateKey(from) > parseDateKey(to)) {
    ;[from, to] = [to, from]
  }

  const months: { year: number; month: number }[] = []
  const cursor = parseDateKey(from)
  cursor.setDate(1)
  const end = parseDateKey(to)

  while (cursor <= end) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() })
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months
}

function buildCalendarWeekGrid(
  gridStart: Date,
  gridEnd: Date,
  entryMap: Map<string, PlanDayEntry>,
  rangeKeys: Set<string>,
): PlanCalendarWeek[] {
  const weeks: PlanCalendarWeek[] = []
  const weekStart = new Date(gridStart)

  while (weekStart <= gridEnd) {
    const week: PlanCalendarDay[] = []
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + d)
      const key = toDateKey(date)
      week.push({
        date: key,
        entry: entryMap.get(key) ?? null,
        isOutsideRange: !rangeKeys.has(key),
      })
    }
    weeks.push(week)
    weekStart.setDate(weekStart.getDate() + 7)
  }

  return weeks
}

export function buildPlanCalendarWeeks(
  entries: PlanDayEntry[],
  fromKey: string,
  toKey: string,
): PlanCalendarWeek[] {
  const entryMap = new Map(entries.map((e) => [e.date, e]))
  let from = fromKey
  let to = toKey
  if (parseDateKey(from) > parseDateKey(to)) {
    ;[from, to] = [to, from]
  }
  const rangeKeys = new Set(enumerateDateKeys(from, to))

  const gridStart = parseDateKey(from)
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7))

  const gridEnd = parseDateKey(to)
  if (gridEnd.getDay() !== 0) {
    gridEnd.setDate(gridEnd.getDate() + ((7 - gridEnd.getDay()) % 7))
  }

  return buildCalendarWeekGrid(gridStart, gridEnd, entryMap, rangeKeys)
}

export function buildPlanCalendarMonth(
  year: number,
  month: number,
  entries: PlanDayEntry[],
  fromKey: string,
  toKey: string,
): PlanCalendarWeek[] {
  const entryMap = new Map(entries.map((e) => [e.date, e]))
  let from = fromKey
  let to = toKey
  if (parseDateKey(from) > parseDateKey(to)) {
    ;[from, to] = [to, from]
  }
  const rangeKeys = new Set(enumerateDateKeys(from, to))

  const monthStart = new Date(year, month, 1, 12, 0, 0)
  const monthEnd = new Date(year, month + 1, 0, 12, 0, 0)

  const gridStart = new Date(monthStart)
  gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7))

  const gridEnd = new Date(monthEnd)
  if (gridEnd.getDay() !== 0) {
    gridEnd.setDate(gridEnd.getDate() + ((7 - gridEnd.getDay()) % 7))
  }

  const weeks = buildCalendarWeekGrid(gridStart, gridEnd, entryMap, rangeKeys)

  return weeks.map((week) =>
    week.map((day) => {
      const d = parseDateKey(day.date)
      return {
        ...day,
        isOutsideMonth: d.getFullYear() !== year || d.getMonth() !== month,
      }
    }),
  )
}

export function createDefaultExamPlan(moduleIds: string[], examDate: string): ExamPlan {
  return {
    examDate,
    moduleIds,
    createdAt: Date.now(),
    dailyReviews: {},
    dailyNewCards: {},
  }
}

export function recordDailyReview(plan: ExamPlan, count = 1, now = Date.now()): ExamPlan {
  const key = toDateKey(now)
  return {
    ...plan,
    dailyReviews: { ...plan.dailyReviews, [key]: (plan.dailyReviews[key] ?? 0) + count },
  }
}

export function recordDailyNewCard(plan: ExamPlan, count = 1, now = Date.now()): ExamPlan {
  const key = toDateKey(now)
  return {
    ...plan,
    dailyNewCards: { ...plan.dailyNewCards, [key]: (plan.dailyNewCards[key] ?? 0) + count },
  }
}

export function previewExamPlanSchedule(
  examDate: string,
  moduleIds: string[],
  cardsByModule: Record<string, Flashcard[]>,
  modules: Module[],
  now = Date.now(),
): ExamPlanSchedule {
  return buildExamPlanSchedule(createDefaultExamPlan(moduleIds, examDate), cardsByModule, modules, now)
}

export function computeExamForecast(
  plan: ExamPlan,
  cardsByModule: Record<string, Flashcard[]>,
  modules: Module[],
  now = Date.now(),
) {
  return buildExamPlanSchedule(plan, cardsByModule, modules, now).forecast
}

export { createDefaultSrs }
