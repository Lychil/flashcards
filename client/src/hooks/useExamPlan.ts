import { useCallback, useEffect, useMemo, useState } from 'react'
import { recordStudyForPlan } from '../lib/planStudySync'
import {
  buildExamPlanSchedule,
  createDefaultExamPlan,
} from '../lib/examPlan'
import { EXAM_PLAN_SCHEMA_VERSION, normalizeStoredExamPlan } from '../lib/mockExamPlan'
import { examPlanRepository } from '../services/examPlanRepository'
import type { ExamPlan, ExamPlanForecast, ExamPlanSchedule } from '../types/examPlan'
import type { Flashcard } from '../types/flashcard'
import type { Module } from '../types/module'

export function useExamPlan(
  cardsByModule: Record<string, Flashcard[]>,
  modules: Module[] = [],
) {
  const [plan, setPlan] = useState<ExamPlan | null>(() => examPlanRepository.load())

  useEffect(() => {
    if (!plan) return
    const normalized = normalizeStoredExamPlan(plan)
    if (
      normalized.examDate !== plan.examDate ||
      normalized.schemaVersion !== plan.schemaVersion ||
      normalized.isMock !== plan.isMock ||
      normalized.userConfirmed !== plan.userConfirmed ||
      normalized.goalTitle !== plan.goalTitle ||
      normalized.targetReadinessPercent !== plan.targetReadinessPercent
    ) {
      setPlan(normalized)
      return
    }
    examPlanRepository.save(plan)
  }, [plan])

  const schedule: ExamPlanSchedule | null = useMemo(() => {
    if (!plan) return null
    return buildExamPlanSchedule(plan, cardsByModule, modules)
  }, [plan, cardsByModule, modules])

  const forecast: ExamPlanForecast | null = useMemo(() => {
    if (schedule) return schedule.forecast
    return null
  }, [schedule])

  const setExamPlan = useCallback(
    (
      examDate: string,
      moduleIds: string[],
      goalTitle: string,
      targetReadinessPercent: number,
    ) => {
      const trimmedGoal = goalTitle.trim()
      const target = Math.min(100, Math.max(50, Math.round(targetReadinessPercent)))
      setPlan((prev) =>
        prev
          ? {
              ...prev,
              examDate,
              moduleIds,
              goalTitle: trimmedGoal,
              targetReadinessPercent: target,
              isMock: false,
              userConfirmed: true,
              schemaVersion: EXAM_PLAN_SCHEMA_VERSION,
            }
          : {
              ...createDefaultExamPlan(moduleIds, examDate),
              goalTitle: trimmedGoal,
              targetReadinessPercent: target,
              isMock: false,
              userConfirmed: true,
              schemaVersion: EXAM_PLAN_SCHEMA_VERSION,
            },
      )
    },
    [],
  )

  const updatePlan = useCallback((patch: Partial<ExamPlan>) => {
    setPlan((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const clearPlan = useCallback(() => {
    setPlan(null)
    examPlanRepository.clear()
  }, [])

  const syncStudyProgress = useCallback((moduleId: string, card: Flashcard) => {
    const next = recordStudyForPlan({ moduleId, card })
    if (next) setPlan(next)
  }, [])

  return {
    plan,
    schedule,
    forecast,
    setExamPlan,
    updatePlan,
    clearPlan,
    syncStudyProgress,
  }
}
