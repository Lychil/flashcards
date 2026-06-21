import type { ExamPlanForecast } from '../../types/examPlan'
import { pluralizeRu } from '../../lib/pluralizeRu'
import { ExamPlanStatsPanel } from './ExamPlanStatsPanel'
import {
  PLAN_TARGET_PERCENT,
  planBodyClass,
  planLabelClass,
  planMetricCardClass,
  planSectionTitleClass,
} from './examPlanStyles'

function pluralizeDays(count: number): string {
  return pluralizeRu(count, ['день', 'дня', 'дней'])
}

export function ExamPlanCountdownCard({ forecast }: { forecast: ExamPlanForecast }) {
  const target = forecast.targetReadinessPercent ?? PLAN_TARGET_PERCENT

  return (
    <article>
      <div className="grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <p className={planLabelClass}>До экзамена</p>
          <p className="mt-2 text-[36px] font-bold tabular-nums leading-none tracking-[-0.04em] text-text-primary">
            {forecast.daysRemaining}
            <span className="ml-2 text-[18px] font-semibold text-text-secondary">
              {pluralizeDays(forecast.daysRemaining)}
            </span>
          </p>
        </div>
        <div className="min-w-0">
          <p className={planLabelClass}>Цель к экзамену</p>
          <p className="mt-2 text-[36px] font-bold tabular-nums leading-none tracking-[-0.04em] text-text-primary">
            {target}
            <span className="ml-2 text-[18px] font-semibold text-text-secondary">%</span>
          </p>
        </div>
      </div>
    </article>
  )
}

export function ExamPlanReadinessSection({ forecast }: { forecast: ExamPlanForecast }) {
  return (
    <div className="min-w-0">
      <ExamPlanCountdownCard forecast={forecast} />
    </div>
  )
}

export function ExamPlanGoalSection({ goalTitle }: { goalTitle?: string | null }) {
  const displayGoal = goalTitle?.trim()

  return (
    <section className="min-w-0">
      <h2 className={planSectionTitleClass}>Цель</h2>
      <article className={`mt-4 ${planMetricCardClass}`}>
        {displayGoal ? (
          <p className="text-[15px] font-medium leading-snug text-text-primary">{displayGoal}</p>
        ) : (
          <p className={planBodyClass}>Цель не задана — укажите её в настройках плана.</p>
        )}
      </article>
    </section>
  )
}

export function ExamPlanReadinessRail({
  forecast,
  goalTitle,
}: {
  forecast: ExamPlanForecast
  goalTitle?: string | null
}) {
  return (
    <div className="flex min-w-0 flex-col gap-8">
      <ExamPlanGoalSection goalTitle={goalTitle} />

      <section className="min-w-0">
        <h2 className={planSectionTitleClass}>Статистика</h2>
        <div className="mt-4 flex flex-col gap-4">
          <ExamPlanCountdownCard forecast={forecast} />
          <ExamPlanStatsPanel forecast={forecast} />
        </div>
      </section>
    </div>
  )
}
