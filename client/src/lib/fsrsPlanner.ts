import type { Flashcard } from '../types/flashcard'
import type {
  ExamPlan,
  ExamPlanForecast,
  ExamPlanSchedule,
  PlanCalendarDay,
  PlanCalendarWeek,
  PlanDayEntry,
  ReadinessPoint,
} from '../types/examPlan'
import { DEFAULT_PLAN_TARGET_READINESS_PERCENT } from '../types/examPlan'
import type { Module } from '../types/module'
import { buildTodaySession } from './reviewQueue'
import {
  cloneFsrsCard,
  createDefaultSrs,
  DAILY_NEW_CARD_LIMIT,
  endOfDay,
  getFsrsEngine,
  getPlanRequestRetention,
  getRetrievability,
  isFsrsCardDue,
  isNewCard,
  startOfDay,
  toFsrsCard,
} from './fsrsEngine'
import { Rating, State, type Card } from 'ts-fsrs'
import type { FSRS } from 'ts-fsrs'

const DAY_MS = 24 * 60 * 60 * 1000

function resolvePlanTargetPercent(plan: ExamPlan): number {
  const value = plan.targetReadinessPercent ?? DEFAULT_PLAN_TARGET_READINESS_PERCENT
  return Math.min(100, Math.max(50, Math.round(value)))
}

function planTargetRetention(plan: ExamPlan): number {
  return getPlanRequestRetention(plan)
}

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

function adaptiveNewCardsPerDay(newRemaining: number, daysLeft: number): number {
  if (newRemaining <= 0) return 0
  if (daysLeft <= 0) return Math.min(DAILY_NEW_CARD_LIMIT, newRemaining)
  return Math.min(DAILY_NEW_CARD_LIMIT, Math.ceil(newRemaining / daysLeft))
}

function cloneSimFromCards(
  plan: ExamPlan,
  cardsByModule: Record<string, Flashcard[]>,
  now: number,
): SimCard[] {
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
  return sim
}

function buildPastActualEntries(
  plan: ExamPlan,
  todayKey: string,
): PlanDayEntry[] {
  const planStartKey = toDateKey(plan.createdAt)
  const pastKeys = enumerateDateKeys(planStartKey, todayKey).filter((k) => k < todayKey)
  return pastKeys.map((dateKey) => {
    const actualReviews = plan.dailyReviews[dateKey] ?? 0
    const actualNew = plan.dailyNewCards[dateKey] ?? 0
    const totalActual = actualReviews + actualNew

    return {
      date: dateKey,
      plannedNew: actualNew,
      plannedReviews: actualReviews,
      actualNew,
      actualReviews,
      totalPlanned: totalActual,
      totalActual,
      status: 'past-done',
      isOverloaded: false,
      readinessPercent: 0,
    }
  })
}

function computeScheduleLag(params: {
  allCards: Flashcard[]
  todayLoad: number
  dailyTarget: number
  daysRemaining: number
  elapsedPlanDays: number
  totalPlanDays: number
  predictedReadiness: number
  targetReadiness: number
}): {
  isBehindSchedule: boolean
  daysBehind?: number
  extraCardsPerDay?: number
  scheduleLagCards?: number
  behindMessage?: string
} {
  const {
    allCards,
    todayLoad,
    dailyTarget,
    daysRemaining,
    elapsedPlanDays,
    totalPlanDays,
    predictedReadiness,
    targetReadiness,
  } = params
  const introducedCards = allCards.filter((card) => !isNewCard(card)).length
  const expectedIntroduced =
    totalPlanDays > 0
      ? Math.floor((allCards.length * Math.min(elapsedPlanDays, totalPlanDays)) / totalPlanDays)
      : allCards.length
  const newLag = Math.max(0, expectedIntroduced - introducedCards)
  const overloadLag = Math.max(0, todayLoad - dailyTarget)
  const readinessLagCards = Math.ceil(
    (allCards.length * Math.max(0, targetReadiness - predictedReadiness)) / 100,
  )
  const scheduleLagCards = Math.max(newLag, readinessLagCards) + overloadLag

  if (scheduleLagCards <= 0) {
    return { isBehindSchedule: false }
  }

  const safeDailyTarget = Math.max(1, dailyTarget)
  const daysBehind = Math.max(1, Math.ceil(scheduleLagCards / safeDailyTarget))
  const extraCardsPerDay =
    daysRemaining > 0 ? Math.ceil(scheduleLagCards / daysRemaining) : scheduleLagCards

  return {
    isBehindSchedule: true,
    daysBehind,
    extraCardsPerDay,
    scheduleLagCards,
    behindMessage: formatBehindMessage(daysBehind, scheduleLagCards, extraCardsPerDay),
  }
}

function getDueSimCards(sim: SimCard[], at: Date): SimCard[] {
  const ts = at.getTime()
  return sim
    .filter((s) => isFsrsCardDue(s.fsrs, ts))
    .sort((a, b) => a.fsrs.due.getTime() - b.fsrs.due.getTime())
}

function applySimReviews(sim: SimCard[], due: SimCard[], at: Date, count: number, engine: FSRS) {
  const toReview = due.slice(0, count)
  for (const item of toReview) {
    const idx = sim.findIndex((s) => s.cardId === item.cardId)
    if (idx < 0) continue
    sim[idx].fsrs = engine.next(sim[idx].fsrs, at, Rating.Good).card
  }
}

function applySimNew(sim: SimCard[], newItems: SimCard[], at: Date, count: number, engine: FSRS) {
  let introduced = 0
  for (const item of newItems) {
    if (introduced >= count) break
    const idx = sim.findIndex((s) => s.cardId === item.cardId)
    if (idx < 0 || sim[idx].fsrs.state !== State.New) continue
    sim[idx].fsrs = engine.next(sim[idx].fsrs, at, Rating.Good).card
    introduced += 1
  }
}

function computeReadinessAt(sim: SimCard[], at: Date, totalCards: number, engine: FSRS): number {
  if (totalCards === 0) return 100
  let sum = 0
  for (const s of sim) {
    if (s.fsrs.state === State.New) continue
    sum += engine.get_retrievability(s.fsrs, at, false)
  }
  return Math.round((sum / totalCards) * 100)
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

function pluralizeDaysShort(count: number): string {
  const abs = Math.abs(count)
  const mod100 = abs % 100
  const mod10 = abs % 10
  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

function formatBehindMessage(daysBehind: number, lagCards: number, extraPerDay: number): string {
  return `Отставание примерно ${daysBehind} ${pluralizeDaysShort(daysBehind)}: ${lagCards} ${pluralizeCardsShort(lagCards)} сверх текущего темпа. Чтобы вернуться к цели, добавьте +${extraPerDay} ${pluralizeCardsShort(extraPerDay)} в день.`
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
  const totalCards = allCards.length
  const todayKey = toDateKey(now)
  const examKey = normalizeExamDateForPlan(plan.examDate, plan.createdAt)
  const daysRemaining = daysBetween(parseDateKey(todayKey), parseDateKey(examKey))
  const planFsrs = getFsrsEngine(getPlanRequestRetention(plan))
  const targetPercent = resolvePlanTargetPercent(plan)
  const targetRetention = planTargetRetention(plan)

  const pastEntries = buildPastActualEntries(plan, todayKey)

  const forwardSim = cloneSimFromCards(plan, cardsByModule, now)
  const forwardKeys = enumerateDateKeys(todayKey, examKey).filter((k) => k < examKey)
  const forwardEntries: PlanDayEntry[] = []
  const readinessCurve: ReadinessPoint[] = []

  const currentReadiness = computeReadinessAt(forwardSim, new Date(now), totalCards, planFsrs)
  readinessCurve.push({ date: todayKey, percent: currentReadiness, isAdjusted: false })

  for (const dateKey of forwardKeys) {
    const isToday = dateKey === todayKey
    const dayStart = startOfDay(parseDateKey(dateKey))
    const dayEnd = endOfDay(parseDateKey(dateKey))
    const daysLeft = daysBetween(parseDateKey(dateKey), parseDateKey(examKey))
    const newRemaining = forwardSim.filter((s) => s.fsrs.state === State.New).length
    const plannedNew = adaptiveNewCardsPerDay(newRemaining, daysLeft)

    const dueCards = getDueSimCards(forwardSim, dayEnd)
    const plannedReviews = dueCards.length
    const totalPlanned = plannedReviews + plannedNew

    const actualReviews = isToday ? (plan.dailyReviews[dateKey] ?? 0) : 0
    const actualNew = isToday ? (plan.dailyNewCards[dateKey] ?? 0) : 0
    const totalActual = actualReviews + actualNew

    const moduleBreakdown = buildModuleBreakdown(dueCards, plannedNew, forwardSim, moduleMap)

    applySimReviews(forwardSim, dueCards, dayEnd, plannedReviews, planFsrs)
    applySimNew(forwardSim, forwardSim, dayStart, plannedNew, planFsrs)

    const readinessPercent = computeReadinessAt(forwardSim, dayEnd, totalCards, planFsrs)

    forwardEntries.push({
      date: dateKey,
      plannedNew,
      plannedReviews,
      actualNew,
      actualReviews,
      totalPlanned,
      totalActual,
      status: isToday ? 'today' : 'future',
      isOverloaded: false,
      readinessPercent,
      moduleBreakdown,
    })

    readinessCurve.push({ date: dateKey, percent: readinessPercent, isAdjusted: false })
  }

  const entries = [...pastEntries, ...forwardEntries]

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
      readinessPercent: computeReadinessAt(
        forwardSim,
        endOfDay(parseDateKey(examKey)),
        totalCards,
        planFsrs,
      ),
    })
  }

  let todayEntry = forwardEntries.find((d) => d.status === 'today') ?? null

  const planModules = modules.filter((m) => plan.moduleIds.includes(m.id))
  const todaySession = buildTodaySession(planModules, cardsByModule, {
    plan,
    todayEntry,
    now,
  })

  if (todayEntry) {
    todayEntry = {
      ...todayEntry,
      remainingNew: todaySession.newCount,
      remainingReviews: todaySession.reviewCount,
      totalPlanned: todayEntry.plannedReviews + todayEntry.plannedNew,
    }
    const idx = entries.findIndex((d) => d.status === 'today')
    if (idx >= 0) entries[idx] = todayEntry
  }

  const finalTodayLoad = todaySession.totalDue
  const predictedReadiness =
    entries.find((d) => d.status === 'exam')?.readinessPercent ??
    computeReadinessAt(forwardSim, endOfDay(parseDateKey(examKey)), totalCards, planFsrs)

  const masteredCards = allCards.filter(
    (c) => getRetrievability(c, now, targetRetention) >= targetRetention,
  ).length
  const totalPlanDays = Math.max(
    1,
    daysBetween(parseDateKey(toDateKey(plan.createdAt)), parseDateKey(examKey)),
  )
  const elapsedPlanDays = daysBetween(parseDateKey(toDateKey(plan.createdAt)), parseDateKey(todayKey))
  const dailyTarget = Math.max(
    1,
    (todayEntry?.plannedNew ?? 0) + (todayEntry?.plannedReviews ?? 0),
  )
  const lag = computeScheduleLag({
    allCards,
    todayLoad: finalTodayLoad,
    dailyTarget,
    daysRemaining,
    elapsedPlanDays,
    totalPlanDays,
    predictedReadiness,
    targetReadiness: targetPercent,
  })

  const forecast: ExamPlanForecast = {
    predictedReadinessPercent: predictedReadiness,
    currentReadinessPercent: currentReadiness,
    targetReadinessPercent: targetPercent,
    daysRemaining,
    totalCards,
    masteredCards,
    dueToday: todaySession.reviewCount,
    newRemaining: allCards.filter(isNewCard).length,
    dailyPlan: {
      newCardsPerDay: todayEntry?.plannedNew ?? todaySession.newCount,
      reviewsPerDay: todayEntry?.plannedReviews ?? todaySession.reviewCount,
    },
    isBehindSchedule: lag.isBehindSchedule,
    behindMessage: lag.behindMessage,
    extraCardsPerDay: lag.extraCardsPerDay,
    daysBehind: lag.daysBehind,
    scheduleLagCards: lag.scheduleLagCards,
    todayLoad: finalTodayLoad,
  }

  if (entries.some((d) => d.status === 'exam')) {
    readinessCurve.push({
      date: examKey,
      percent: predictedReadiness,
      isAdjusted: lag.isBehindSchedule,
    })
  }

  const weeks = buildPlanCalendarWeeks(entries, todayKey, examKey)

  return {
    days: entries,
    todayEntry,
    todayLoad: finalTodayLoad,
    forecast,
    readinessCurve,
    weeks,
    calendarFrom: todayKey,
    calendarTo: examKey,
  }
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
    targetReadinessPercent: DEFAULT_PLAN_TARGET_READINESS_PERCENT,
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
