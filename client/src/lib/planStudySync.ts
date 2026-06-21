import { recordDailyNewCard, recordDailyReview } from './examPlan'
import { isNewCard } from './fsrsEngine'
import { examPlanRepository } from '../services/examPlanRepository'
import { reviewDailyRepository } from '../services/reviewDailyRepository'
import type { ExamPlan } from '../types/examPlan'
import type { Flashcard } from '../types/flashcard'

export interface RecordStudyForPlanInput {
  moduleId: string
  /** Card state before SRS rating is applied */
  card: Flashcard
  count?: number
}

/** Засчитывает занятие в счётчики плана, если модуль входит в план подготовки. */
export function recordStudyForPlan({
  moduleId,
  card,
  count = 1,
}: RecordStudyForPlanInput): ExamPlan | null {
  const plan = examPlanRepository.load()
  if (!plan || !plan.moduleIds.includes(moduleId)) return null

  let next = recordDailyReview(plan, count)
  reviewDailyRepository.recordReview(count)

  if (isNewCard(card)) {
    next = recordDailyNewCard(next, count)
    reviewDailyRepository.recordNewCard(count)
  }

  examPlanRepository.save(next)
  return next
}
