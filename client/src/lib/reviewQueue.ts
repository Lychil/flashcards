import type { ExamPlan, PlanDayEntry } from '../types/examPlan'
import type { Flashcard } from '../types/flashcard'
import type { Module } from '../types/module'
import { reviewDailyRepository } from '../services/reviewDailyRepository'
import {
  DAILY_NEW_CARD_LIMIT,
  getDueTimestamp,
  isCardDue,
  isNewCard,
  toDateKey,
} from './fsrsEngine'

export interface ReviewQueueItem {
  card: Flashcard
  moduleId: string
  moduleTitle: string
  moduleColor?: string
  isNew: boolean
}

export interface TodaySession {
  items: ReviewQueueItem[]
  moduleCount: number
  reviewCount: number
  newCount: number
  totalDue: number
}

export interface BuildReviewQueueOptions {
  now?: number
  plan?: ExamPlan | null
  todayEntry?: PlanDayEntry | null
}

function getNewCardsAlreadyToday(plan: ExamPlan | null | undefined, todayKey: string): number {
  if (plan?.dailyNewCards[todayKey] != null) {
    return plan.dailyNewCards[todayKey]
  }
  return reviewDailyRepository.getNewCardsIntroducedToday()
}

function resolveNewCardLimit(
  plan: ExamPlan | null | undefined,
  todayEntry: PlanDayEntry | null | undefined,
  newCardsAlreadyToday: number,
): number {
  const remainingFromCap = Math.max(0, DAILY_NEW_CARD_LIMIT - newCardsAlreadyToday)

  if (todayEntry && todayEntry.status === 'today') {
    const plannedNew = Math.max(0, todayEntry.plannedNew)
    return Math.min(remainingFromCap, plannedNew)
  }

  if (plan) {
    const keys = Object.keys(plan.dailyNewCards)
    const avg =
      keys.length > 0
        ? Math.ceil(
            Object.values(plan.dailyNewCards).reduce((a, b) => a + b, 0) / keys.length,
          )
        : DAILY_NEW_CARD_LIMIT
    return Math.min(remainingFromCap, avg || DAILY_NEW_CARD_LIMIT)
  }

  return remainingFromCap
}

export function buildTodaySession(
  modules: Module[],
  cardsByModule: Record<string, Flashcard[]>,
  options: BuildReviewQueueOptions = {},
): TodaySession {
  const opts = options
  const now = opts.now ?? Date.now()
  const todayKey = toDateKey(now)
  const plan = opts.plan
  const planModuleIds = plan ? new Set(plan.moduleIds) : null

  const activeModules = modules.filter((m) => {
    if (planModuleIds && !planModuleIds.has(m.id)) return false
    return (cardsByModule[m.id]?.length ?? 0) > 0
  })

  const reviewItems: ReviewQueueItem[] = []
  const newCandidates: ReviewQueueItem[] = []
  const moduleIds = new Set<string>()

  for (const mod of activeModules) {
    const cards = cardsByModule[mod.id] ?? []
    for (const card of cards) {
      if (isCardDue(card, now)) {
        reviewItems.push({
          card,
          moduleId: mod.id,
          moduleTitle: mod.title,
          moduleColor: mod.color,
          isNew: false,
        })
        moduleIds.add(mod.id)
      } else if (isNewCard(card)) {
        newCandidates.push({
          card,
          moduleId: mod.id,
          moduleTitle: mod.title,
          moduleColor: mod.color,
          isNew: true,
        })
      }
    }
  }

  const newAlreadyToday = getNewCardsAlreadyToday(plan, todayKey)
  const newLimit = resolveNewCardLimit(plan, opts.todayEntry ?? null, newAlreadyToday)

  const newItems = newCandidates.slice(0, newLimit)
  for (const item of newItems) {
    moduleIds.add(item.moduleId)
  }

  const items = [
    ...reviewItems.sort((a, b) => getDueTimestamp(a.card) - getDueTimestamp(b.card)),
    ...newItems,
  ]

  return {
    items,
    moduleCount: moduleIds.size,
    reviewCount: reviewItems.length,
    newCount: newItems.length,
    totalDue: items.length,
  }
}

/** @deprecated use buildTodaySession */
export interface GlobalReviewQueue {
  items: ReviewQueueItem[]
  moduleCount: number
  totalDue: number
  reviewCount: number
  newCount: number
}

export function buildReviewQueue(
  modules: Module[],
  cardsByModule: Record<string, Flashcard[]>,
  options: BuildReviewQueueOptions | number = {},
): GlobalReviewQueue {
  const opts = typeof options === 'number' ? { now: options } : options
  const session = buildTodaySession(modules, cardsByModule, opts)
  return {
    items: session.items,
    moduleCount: session.moduleCount,
    totalDue: session.totalDue,
    reviewCount: session.reviewCount,
    newCount: session.newCount,
  }
}

export function countDueCards(cards: Flashcard[], now = Date.now()): number {
  return cards.filter((c) => isCardDue(c, now)).length
}
