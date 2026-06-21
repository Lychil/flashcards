import type { ExamPlan } from '../types/examPlan'
import { DEFAULT_PLAN_TARGET_READINESS_PERCENT } from '../types/examPlan'
import {
  createDefaultExamPlan,
  daysBetween,
  normalizeExamDateForPlan,
  parseDateKey,
  toDateKey,
} from './examPlan'

/** Demo horizon — short enough for calendar preview, not ~8 months */
export const MOCK_EXAM_DAYS_AHEAD = 42
export const EXAM_PLAN_SCHEMA_VERSION = 3

export const MOCK_GOAL_TITLE = 'Уверенно сдать экзамен по анатомии'

function withMockGoalTitle(plan: ExamPlan): ExamPlan {
  if (plan.goalTitle?.trim()) return plan
  return { ...plan, goalTitle: MOCK_GOAL_TITLE }
}

function withDefaultTargetReadiness(plan: ExamPlan): ExamPlan {
  if (plan.targetReadinessPercent != null) return plan
  return { ...plan, targetReadinessPercent: DEFAULT_PLAN_TARGET_READINESS_PERCENT }
}

function normalizePlanDefaults(plan: ExamPlan): ExamPlan {
  return withDefaultTargetReadiness(withMockGoalTitle(plan))
}

export function examDateDaysAhead(days: number, from = Date.now()): string {
  const cursor = parseDateKey(toDateKey(from))
  cursor.setDate(cursor.getDate() + days)
  return toDateKey(cursor)
}

export function planDaysUntilExam(plan: ExamPlan, now = Date.now()): number {
  const today = parseDateKey(toDateKey(now))
  const exam = parseDateKey(normalizeExamDateForPlan(plan.examDate, plan.createdAt))
  return daysBetween(today, exam)
}

export function createMockExamPlan(moduleIds: string[], now = Date.now()): ExamPlan {
  const plan = createDefaultExamPlan(moduleIds, examDateDaysAhead(MOCK_EXAM_DAYS_AHEAD, now))
  plan.createdAt = now
  plan.isMock = true
  plan.schemaVersion = EXAM_PLAN_SCHEMA_VERSION
  plan.goalTitle = MOCK_GOAL_TITLE
  plan.targetReadinessPercent = DEFAULT_PLAN_TARGET_READINESS_PERCENT
  return plan
}

export function refreshMockExamPlan(plan: ExamPlan, now = Date.now()): ExamPlan {
  return normalizePlanDefaults({
    ...plan,
    isMock: true,
    schemaVersion: EXAM_PLAN_SCHEMA_VERSION,
    examDate: examDateDaysAhead(MOCK_EXAM_DAYS_AHEAD, now),
  })
}

/** Shorten legacy demo plans that still point months into the future */
export function normalizeStoredExamPlan(plan: ExamPlan, now = Date.now()): ExamPlan {
  const days = planDaysUntilExam(plan, now)

  if (plan.isMock) {
    return refreshMockExamPlan(plan, now)
  }

  // Auto-seeded / never explicitly saved — clamp long horizons (e.g. 247 days)
  if (plan.userConfirmed !== true && days > MOCK_EXAM_DAYS_AHEAD + 7) {
    return refreshMockExamPlan(plan, now)
  }

  if ((plan.schemaVersion ?? 1) !== EXAM_PLAN_SCHEMA_VERSION) {
    return normalizePlanDefaults({ ...plan, schemaVersion: EXAM_PLAN_SCHEMA_VERSION })
  }

  return normalizePlanDefaults(plan)
}
