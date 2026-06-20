import type { ExamPlanForecast } from '../../types/examPlan'
import { PLAN_TARGET_PERCENT, planLabelClass } from './examPlanStyles'

interface ExamPlanStatsPanelProps {
  forecast: ExamPlanForecast
  className?: string
}

const CHART_HEIGHT = 180
const Y_TICKS = [100, 75, 50, 25, 0] as const

/** Пастельные столбики — в духе календаря плана */
const BAR_STYLES = [
  { fill: '#D4CFF0', text: '#6B63A8', label: 'Прогноз' },
  { fill: '#C2E7D8', text: '#3D8A6E', label: 'Весь план' },
  { fill: '#C8DBEB', text: '#4A7391', label: 'К цели' },
] as const

interface ChartMetric {
  key: string
  label: string
  value: number
  fill: string
  text: string
  hint?: string
}

function ReadinessBarChart({ metrics }: { metrics: ChartMetric[] }) {
  return (
    <div className="w-full">
      <div className="flex">
        <div
          className="flex shrink-0 flex-col justify-between pr-2 text-right"
          style={{ height: CHART_HEIGHT }}
          aria-hidden
        >
          {Y_TICKS.map((tick) => (
            <span key={tick} className="text-[10px] leading-none tabular-nums text-text-tertiary">
              {tick}%
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            className="pointer-events-none absolute inset-0 flex flex-col justify-between"
            aria-hidden
          >
            {Y_TICKS.map((tick) => (
              <div
                key={tick}
                className="w-full border-t border-[#e6e8ee]"
                style={tick === 0 ? { borderColor: '#d8dce4' } : undefined}
              />
            ))}
          </div>

          <div
            className="relative flex items-end justify-center gap-2 px-2 sm:gap-2.5"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label="Прогноз к экзамену, освоение всего плана и число карточек на уровне цели"
          >
            {metrics.map((metric) => {
              const clamped = Math.max(0, Math.min(100, metric.value))
              const barHeight = (clamped / 100) * CHART_HEIGHT

              return (
                <div
                  key={metric.key}
                  className="relative flex w-11 flex-col justify-end sm:w-12"
                  style={{ height: CHART_HEIGHT }}
                >
                  {clamped > 0 && (
                    <div
                      className="relative w-full rounded-t-[10px] transition-[height] duration-500 ease-out"
                      style={{ height: Math.max(4, barHeight), backgroundColor: metric.fill }}
                    >
                      <span
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap px-0.5 text-[11px] font-semibold tabular-nums leading-none sm:text-[12px]"
                        style={{ color: metric.text }}
                      >
                        {Math.round(clamped)}%
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartLegend({ metrics }: { metrics: ChartMetric[] }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-x-2 gap-y-3">
      {metrics.map((metric) => (
        <div key={metric.key} className="min-w-0 text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: metric.fill }}
              aria-hidden
            />
            <span className={`${planLabelClass} text-[13px] text-text-primary`}>{metric.label}</span>
          </div>
          {metric.hint && (
            <p className="text-[12px] leading-snug text-text-tertiary">{metric.hint}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export function ExamPlanStatsPanel({ forecast, className = '' }: ExamPlanStatsPanelProps) {
  const target = forecast.targetReadinessPercent ?? PLAN_TARGET_PERCENT
  const masteredPercent =
    forecast.totalCards > 0 ? (forecast.masteredCards / forecast.totalCards) * 100 : 0

  const values = [
    forecast.predictedReadinessPercent,
    forecast.currentReadinessPercent,
    masteredPercent,
  ]

  const hints = [
    'К экзамену, если заниматься по плану',
    'Насколько освоен весь материал. Новые карточки тоже входят в расчёт',
    forecast.totalCards > 0
      ? `${forecast.masteredCards} из ${forecast.totalCards} — уже на уровне цели ${target}%`
      : undefined,
  ]

  const metrics: ChartMetric[] = BAR_STYLES.map((style, index) => ({
    key: ['forecast', 'current', 'mastered'][index],
    label: style.label,
    value: values[index],
    fill: style.fill,
    text: style.text,
    hint: hints[index],
  }))

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <p className={planLabelClass}>Готовность</p>

      <div className="mt-3">
        <ReadinessBarChart metrics={metrics} />
      </div>

      <ChartLegend metrics={metrics} />
    </div>
  )
}
