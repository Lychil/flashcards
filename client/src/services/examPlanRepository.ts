import { normalizeStoredExamPlan } from '../lib/mockExamPlan'
import type { ExamPlan } from '../types/examPlan'
import { STORAGE_KEYS } from './storageKeys'

export interface ExamPlanRepository {
  load(): ExamPlan | null
  save(plan: ExamPlan): void
  clear(): void
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const examPlanRepository: ExamPlanRepository = {
  load() {
    const plan = readJson<ExamPlan>(STORAGE_KEYS.examPlan)
    if (!plan) return null

    const normalized = normalizeStoredExamPlan(plan)
    if (
      normalized.examDate !== plan.examDate ||
      normalized.isMock !== plan.isMock ||
      normalized.schemaVersion !== plan.schemaVersion ||
      normalized.userConfirmed !== plan.userConfirmed ||
      normalized.goalTitle !== plan.goalTitle ||
      normalized.targetReadinessPercent !== plan.targetReadinessPercent
    ) {
      localStorage.setItem(STORAGE_KEYS.examPlan, JSON.stringify(normalized))
    }
    return normalized
  },

  save(plan) {
    localStorage.setItem(STORAGE_KEYS.examPlan, JSON.stringify(plan))
  },

  clear() {
    localStorage.removeItem(STORAGE_KEYS.examPlan)
  },
}
