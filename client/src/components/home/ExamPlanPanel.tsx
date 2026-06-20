import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import type { ExamPlanForecast } from '../../types/examPlan'
import { PLAN_PURPLE, planBodyClass, planCaptionClass, planLabelClass, planSurfaceClass } from '../exam-plan/examPlanStyles'

interface ExamPlanPanelProps {
  hasPlan: boolean
  forecast: ExamPlanForecast | null
}

export function ExamPlanPanel({ hasPlan, forecast }: ExamPlanPanelProps) {
  if (!hasPlan || !forecast) {
    return (
      <section className={planSurfaceClass}>
        <p className={`mb-1 ${planLabelClass}`}>План подготовки</p>
        <p className={`mb-4 ${planBodyClass}`}>
          Календарь нагрузки: новые карточки и повторы по дням до экзамена.
        </p>
        <Link
          to="/plan"
          className="inline-flex items-center gap-2 text-[14px] font-medium transition-opacity hover:opacity-80"
          style={{ color: PLAN_PURPLE }}
        >
          <CalendarDays size={15} strokeWidth={2} />
          Создать план
        </Link>
      </section>
    )
  }

  return (
    <section className={planSurfaceClass}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className={planLabelClass}>План подготовки</p>
        <Link
          to="/plan"
          className="text-[13px] font-medium hover:underline"
          style={{ color: PLAN_PURPLE }}
        >
          Календарь →
        </Link>
      </div>
      <p className={`mb-1 ${planCaptionClass}`}>Прогноз готовности к экзамену</p>
      <p className="text-[28px] font-semibold tabular-nums text-text-primary sm:text-[32px]">
        {forecast.predictedReadinessPercent}%
      </p>
      <p className={`mt-1.5 ${planBodyClass}`}>
        Через {forecast.daysRemaining} дн. · сегодня {forecast.dailyPlan.reviewsPerDay} повт. +{' '}
        {forecast.dailyPlan.newCardsPerDay} нов.
      </p>
      {forecast.behindMessage && (
        <p className={`mt-2 ${planCaptionClass} leading-snug`} style={{ color: '#d97706' }}>{forecast.behindMessage}</p>
      )}
    </section>
  )
}
