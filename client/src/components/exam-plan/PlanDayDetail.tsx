import { Check, Minus, X } from 'lucide-react'
import type { PlanDayEntry } from '../../types/examPlan'
import { statsCaptionClass, statsCardClass, statsCardPaddingClass, statsLabelClass } from '../stats/statsStyles'

interface PlanDayDetailProps {
  entry: PlanDayEntry | null
}

export function PlanDayDetail({ entry }: PlanDayDetailProps) {
  if (!entry) return null

  if (entry.status === 'exam') {
    return (
      <article className={[statsCardPaddingClass, statsCardClass].join(' ')}>
        <p className={statsLabelClass}>День экзамена</p>
        <p className="mt-2 text-[22px] font-semibold text-text-primary">
          {new Date(`${entry.date}T12:00:00`).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </article>
    )
  }

  return (
    <article className={[statsCardPaddingClass, statsCardClass].join(' ')}>
      <p className={statsLabelClass}>
        {entry.status === 'today' ? 'Сегодня' : 'Нагрузка дня'}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <LoadCell label="Новых" planned={entry.plannedNew} actual={entry.actualNew} showActual={entry.status !== 'future'} />
        <LoadCell label="Повторений" planned={entry.plannedReviews} actual={entry.actualReviews} showActual={entry.status !== 'future'} />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className={statsCaptionClass}>Итого</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-semibold tabular-nums text-text-primary">
            {entry.totalPlanned}
          </span>
          {entry.status !== 'future' && (
            <span className="text-[14px] text-text-secondary">
              / {entry.totalActual} факт
            </span>
          )}
        </div>
      </div>

      {entry.isOverloaded && (
        <p className="mt-2 text-[12px] font-medium text-[#b04472]">
          День перегружен — план пересчитан из-за отставания
        </p>
      )}
    </article>
  )
}

function LoadCell({
  label,
  planned,
  actual,
  showActual,
}: {
  label: string
  planned: number
  actual: number
  showActual: boolean
}) {
  const met = actual >= planned

  return (
    <div className="rounded-xl bg-surface-subtle px-3 py-2.5">
      <p className={`${statsCaptionClass} mb-1`}>{label}</p>
      <div className="flex items-center gap-2">
        <span className="text-[18px] font-semibold tabular-nums text-text-primary">{planned}</span>
        {showActual && (
          <>
            <StatusIcon met={met} partial={actual > 0 && !met} />
            <span className="text-[13px] tabular-nums text-text-secondary">{actual}</span>
          </>
        )}
      </div>
    </div>
  )
}

function StatusIcon({ met, partial }: { met: boolean; partial: boolean }) {
  if (met) return <Check size={14} strokeWidth={2.5} className="text-[#16a34a]" />
  if (partial) return <Minus size={14} strokeWidth={2.5} className="text-[#d97706]" />
  return <X size={14} strokeWidth={2.5} className="text-[#ef4444]" />
}

interface PlanVsFactSummaryProps {
  days: PlanDayEntry[]
}

export function PlanVsFactSummary({ days }: PlanVsFactSummaryProps) {
  const pastDays = days.filter(
    (d) => d.status === 'past-done' || d.status === 'past-partial' || d.status === 'past-missed',
  )

  if (pastDays.length === 0) return null

  const done = pastDays.filter((d) => d.status === 'past-done').length
  const partial = pastDays.filter((d) => d.status === 'past-partial').length
  const missed = pastDays.filter((d) => d.status === 'past-missed').length

  return (
    <article className={[statsCardPaddingClass, statsCardClass].join(' ')}>
      <p className={statsLabelClass}>План vs факт</p>
      <p className={`mt-1 ${statsCaptionClass}`}>Прошедшие дни подготовки</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <StatPill count={done} label="выполнено" color="#6BC9A7" />
        <StatPill count={partial} label="частично" color="#F5B84C" />
        <StatPill count={missed} label="пропущено" color="#E879A9" />
      </div>
    </article>
  )
}

function StatPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[14px] font-semibold tabular-nums text-text-primary">{count}</span>
      <span className="text-[13px] text-text-secondary">{label}</span>
    </div>
  )
}
