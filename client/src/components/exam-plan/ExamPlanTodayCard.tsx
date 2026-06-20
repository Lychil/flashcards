import { RotateCcw, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PlanDayEntry } from '../../types/examPlan'
import { pluralizeRu } from '../../lib/pluralizeRu'
import {
  estimateStudyMinutes,
  LABELS,
  PLAN_ICON_LABELS,
  PLAN_PURPLE,
  planBlockClass,
  planCaptionClass,
  planEyebrowClass,
  planSurfaceClass,
} from './examPlanStyles'

interface ExamPlanTodayCardProps {
  entry: PlanDayEntry
  moduleCount: number
  flush?: boolean
}

export function ExamPlanTodayCard({ entry, moduleCount, flush = false }: ExamPlanTodayCardProps) {
  const minutes = estimateStudyMinutes(entry.totalPlanned)

  return (
    <div
      className={[
        flush ? planBlockClass : planSurfaceClass,
        'mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between',
      ].join(' ')}
    >
      <div className="min-w-0">
        <p className={`mb-1.5 ${planEyebrowClass}`}>На сегодня</p>
        <p className="text-[18px] font-medium leading-snug text-text-primary">
          <span className="inline-flex items-center gap-1" title={LABELS.todayNew}>
            <Sparkles size={14} className="shrink-0 text-[#7F77DD]" aria-hidden />
            {entry.plannedNew}{' '}
            {pluralizeRu(entry.plannedNew, ['карточка', 'карточки', 'карточек'])}{' '}
            {PLAN_ICON_LABELS.firstStudyCount}
          </span>
          {' · '}
          <span className="inline-flex items-center gap-1" title={LABELS.todayReviews}>
            <RotateCcw size={14} className="shrink-0 text-[#5B9FD4]" aria-hidden />
            {entry.plannedReviews}{' '}
            {pluralizeRu(entry.plannedReviews, ['карточка', 'карточки', 'карточек'])}{' '}
            {PLAN_ICON_LABELS.reviewDueCount}
          </span>
        </p>
        {entry.carryoverFromYesterday != null && entry.carryoverFromYesterday > 0 && (
          <p className={planCaptionClass}>
            (+{entry.carryoverFromYesterday} с прошлого дня)
          </p>
        )}
        <p className={`mt-1.5 ${planCaptionClass}`}>
          {moduleCount > 0 && <>из {moduleCount} модулей · </>}
          ≈ {minutes} мин на занятие
        </p>
      </div>
      <Link
        to="/review"
        className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-xl px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: PLAN_PURPLE }}
      >
        Начать
      </Link>
    </div>
  )
}
