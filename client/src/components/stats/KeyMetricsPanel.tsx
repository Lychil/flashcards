import { BookOpen, Flame, HelpCircle, Target } from 'lucide-react'
import { pluralizeRu } from '../../lib/pluralizeRu'
import { Tooltip } from '../ui/Tooltip'
import { PLAN_PURPLE, planSurfaceClass } from '../exam-plan/examPlanStyles'

type KeyMetricsVariant = 'default' | 'compact'

interface MetricProps {
  icon: React.ReactNode
  label: string
  value: string | number
  hint: string
  accent?: string
  variant?: KeyMetricsVariant
}

function MetricHint({ label, hint }: { label: string; hint: string }) {
  return (
    <Tooltip label={hint} side="bottom" align="end" trigger="both">
      <button
        type="button"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-secondary"
        aria-label={`Пояснение: ${label}`}
      >
        <HelpCircle size={16} strokeWidth={2} />
      </button>
    </Tooltip>
  )
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  accent = PLAN_PURPLE,
  variant = 'default',
}: MetricProps) {
  if (variant === 'compact') {
    return (
      <article className="rounded-[18px] border border-border bg-white px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accent}18`, color: accent }}
          >
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-1">
              <span className="text-[12px] font-medium leading-snug text-text-secondary">{label}</span>
              <MetricHint label={label} hint={hint} />
            </div>
            <p className="mt-1 text-[24px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-text-primary">
              {value}
            </p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`${planSurfaceClass} flex min-h-[7.5rem] min-w-0 flex-col`}>
      <div className="mb-3 flex items-start gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-1">
            <span className="text-[13px] font-medium leading-snug text-text-secondary">{label}</span>
            <MetricHint label={label} hint={hint} />
          </div>
        </div>
      </div>
      <p className="text-[28px] font-semibold tabular-nums tracking-[-0.02em] text-text-primary sm:text-[32px]">
        {value}
      </p>
    </article>
  )
}

interface KeyMetricsPanelProps {
  readinessPercent: number | null
  reviewCount: number
  newCount: number
  streakDays: number
  className?: string
  /** compact — одна колонка для узкого рейла плана */
  variant?: KeyMetricsVariant
}

function pluralizeDays(count: number): string {
  return pluralizeRu(count, ['день', 'дня', 'дней'])
}

export function KeyMetricsPanel({
  readinessPercent,
  reviewCount,
  newCount,
  streakDays,
  className = '',
  variant = 'default',
}: KeyMetricsPanelProps) {
  const todayTotal = reviewCount + newCount
  const isCompact = variant === 'compact'

  const labels = isCompact
    ? {
        readiness: 'Готовность',
        today: 'Сегодня',
        activity: 'Стрик',
      }
    : {
        readiness: 'Готовность к экзамену',
        today: 'К повторению сегодня',
        activity: 'Активность',
      }

  const gridClass =
    variant === 'compact'
      ? 'flex flex-col gap-3'
      : 'grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={[gridClass, className].filter(Boolean).join(' ')}>
      <MetricCard
        variant={variant}
        icon={<Target size={17} strokeWidth={2} />}
        label={labels.readiness}
        value={readinessPercent != null ? `${readinessPercent}%` : '—'}
        hint="Прогноз на основе твоих ответов и дней до экзамена: вероятность, что материал останется в памяти к дате экзамена (алгоритм FSRS)."
      />
      <MetricCard
        variant={variant}
        icon={<BookOpen size={17} strokeWidth={2} />}
        label={labels.today}
        value={todayTotal}
        hint={`Созрело ${reviewCount} ${pluralizeRu(reviewCount, ['повтор', 'повтора', 'повторов'])} и ${newCount} ${pluralizeRu(newCount, ['новая', 'новые', 'новых'])} по дневному лимиту. Это же число — в сессии и в календаре на сегодня.`}
        accent="#534AB7"
      />
      <MetricCard
        variant={variant}
        icon={<Flame size={17} strokeWidth={2} />}
        label={labels.activity}
        value={streakDays}
        hint={`${streakDays} ${pluralizeDays(streakDays)} подряд с повторениями. Стрик растёт, когда вы проходите карточки каждый день.`}
        accent="#d97706"
      />
    </div>
  )
}
