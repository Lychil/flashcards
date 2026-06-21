import { ChevronDown, CircleCheck, CircleX, Play, RotateCcw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { PlanDayEntry } from '../../types/examPlan'
import {
  LABELS,
  PLAN_AMBER,
  PLAN_BLUE,
  PLAN_GREEN,
  PLAN_ICON_LABELS,
  PLAN_PURPLE,
  PLAN_PURPLE_DARK,
} from './examPlanStyles'

interface ExamPlanDayAgendaProps {
  days: PlanDayEntry[]
}

const COLLAPSED_AROUND = 2

export function ExamPlanDayAgenda({ days }: ExamPlanDayAgendaProps) {
  const [expanded, setExpanded] = useState(false)

  const studyDays = days.filter((d) => d.status !== 'exam')
  const examDay = days.find((d) => d.status === 'exam')

  const todayIndex = studyDays.findIndex((d) => d.status === 'today')

  const visibleDays = useMemo(() => {
    if (expanded || studyDays.length <= 7) return studyDays

    const start = Math.max(0, todayIndex - COLLAPSED_AROUND)
    const end = Math.min(studyDays.length, todayIndex + COLLAPSED_AROUND + 3)
    return studyDays.slice(start, end)
  }, [expanded, studyDays, todayIndex])

  const hiddenCount = studyDays.length - visibleDays.length

  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h2 className="text-[16px] font-medium text-text-primary">План по дням</h2>
        <span className="text-[12px] text-text-tertiary">план · факт</span>
      </div>

      <div className="overflow-hidden rounded-2xl">
        <div className="hidden grid-cols-[5rem_1fr_1fr_5.5rem] gap-3 px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary sm:grid sm:px-4">
          <span>День</span>
          <span>План</span>
          <span>Факт</span>
          <span className="text-right">Статус</span>
        </div>
        <div className="divide-y divide-surface-muted">
          {visibleDays.map((day) => (
            <AgendaRow key={day.date} day={day} />
          ))}
          {examDay && <AgendaRow day={examDay} />}
        </div>
      </div>

      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 text-[13px] text-text-secondary transition-colors hover:text-text-primary"
        >
          Показать все {studyDays.length}{' '}
          {studyDays.length === 1 ? 'день' : studyDays.length < 5 ? 'дня' : 'дней'}
          <ChevronDown size={14} strokeWidth={2} />
        </button>
      )}
    </section>
  )
}

function AgendaRow({ day }: { day: PlanDayEntry }) {
  const isToday = day.status === 'today'
  const isExam = day.status === 'exam'
  const isFuture = day.status === 'future'
  const showFact = !isExam && !isFuture
  const dateCol = formatDateColumn(day.date, isToday, isExam)

  return (
    <div
      className={[
        'grid grid-cols-[5rem_1fr_auto] items-center gap-3 px-3 py-3 sm:grid-cols-[5rem_1fr_1fr_5.5rem] sm:gap-4 sm:px-4',
        isToday ? 'bg-[#f5f3ff]/60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="text-[13px] leading-snug">{dateCol}</div>

      {isExam ? (
        <>
          <div className="col-span-2 text-[13px] text-text-secondary sm:col-span-1">День экзамена</div>
          <StatusLabel day={day} />
        </>
      ) : (
        <>
          <LoadTileGroup
            newCount={day.plannedNew}
            reviewCount={day.plannedReviews}
            variant="plan"
          />
          {showFact ? (
            <LoadTileGroup
              newCount={day.actualNew}
              reviewCount={day.actualReviews}
              plannedNew={day.plannedNew}
              plannedReviews={day.plannedReviews}
              variant="fact"
              status={day.status}
            />
          ) : (
            <LoadTileGroup variant="empty" />
          )}
          <StatusLabel day={day} />
        </>
      )}
    </div>
  )
}

function LoadTileGroup({
  newCount = 0,
  reviewCount = 0,
  plannedNew,
  plannedReviews,
  variant,
  status,
}: {
  newCount?: number
  reviewCount?: number
  plannedNew?: number
  plannedReviews?: number
  variant: 'plan' | 'fact' | 'empty'
  status?: PlanDayEntry['status']
}) {
  if (variant === 'empty') {
    return (
      <div className="flex flex-wrap gap-1.5">
        <EmptyLoadTile kind="new" />
        <EmptyLoadTile kind="review" />
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <LoadTile
        kind="new"
        count={newCount}
        planned={plannedNew}
        variant={variant}
        status={status}
      />
      <LoadTile
        kind="review"
        count={reviewCount}
        planned={plannedReviews}
        variant={variant}
        status={status}
      />
    </div>
  )
}

function EmptyLoadTile({ kind }: { kind: 'new' | 'review' }) {
  const isNew = kind === 'new'
  const Icon = isNew ? Sparkles : RotateCcw
  const iconColor = isNew ? PLAN_PURPLE : PLAN_BLUE
  return (
    <div className="flex min-w-[3.4rem] flex-col items-center justify-center rounded-xl bg-surface-subtle/50 px-2 py-1.5 opacity-60">
      <Icon size={10} strokeWidth={2} style={{ color: iconColor }} aria-hidden />
      <span className="mt-0.5 text-[13px] font-medium text-text-tertiary">—</span>
    </div>
  )
}

function LoadTile({
  kind,
  count,
  planned,
  variant,
  status,
}: {
  kind: 'new' | 'review'
  count: number
  planned?: number
  variant: 'plan' | 'fact'
  status?: PlanDayEntry['status']
}) {
  const isNew = kind === 'new'
  const Icon = isNew ? Sparkles : RotateCcw
  const iconColor = isNew ? PLAN_PURPLE : PLAN_BLUE
  const hint = isNew ? LABELS.todayNew : LABELS.todayReviews
  const label = isNew ? PLAN_ICON_LABELS.firstStudyCount : PLAN_ICON_LABELS.reviewDueCount

  const planBg = isNew ? '#f5f3ff' : '#eff6fc'
  const factBg = factTileBackground(status, count, planned ?? 0)

  const bg = variant === 'plan' ? planBg : factBg

  const met = variant === 'fact' && planned != null && count >= planned
  const partial = variant === 'fact' && planned != null && count > 0 && count < planned

  return (
    <div
      title={hint}
      className="flex min-w-[3.4rem] flex-col items-center justify-center rounded-xl border border-border px-2 py-1.5"
      style={{ backgroundColor: bg }}
    >
      <Icon size={10} strokeWidth={2} style={{ color: iconColor }} aria-hidden />
      <span className="mt-0.5 text-[13px] font-semibold tabular-nums leading-none text-text-primary">
        {count}
      </span>
      {variant === 'fact' && planned != null && (
        <span
          className={[
            'mt-0.5 text-[9px] tabular-nums leading-none',
            met ? 'text-[#15803d]' : partial ? 'text-[#d97706]' : count === 0 ? 'text-text-tertiary' : 'text-[#be123c]',
          ].join(' ')}
        >
          / {planned}
        </span>
      )}
      {variant === 'plan' && count === 0 && (
        <span className="mt-0.5 text-[9px] text-text-tertiary">—</span>
      )}
      {variant === 'plan' && count > 0 && (
        <span className="mt-0.5 text-[8px] leading-none text-text-tertiary">{label}</span>
      )}
    </div>
  )
}

function factTileBackground(
  status: PlanDayEntry['status'] | undefined,
  actual: number,
  planned: number,
): string {
  if (!status || status === 'today' || status === 'future') {
    return actual >= planned && planned > 0 ? '#ecfdf3' : actual > 0 ? '#fffbeb' : '#ffffff'
  }
  if (status === 'past-done') return '#ecfdf3'
  if (status === 'past-partial') return '#fffbeb'
  if (status === 'past-missed') return '#fef2f2'
  return '#ffffff'
}

function formatDateColumn(date: string, isToday: boolean, isExam: boolean) {
  const d = new Date(`${date}T12:00:00`)
  const weekday = d.toLocaleDateString('ru-RU', { weekday: 'short' })
  const dayMonth = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  if (isToday) {
    return (
      <>
        <span className="font-medium capitalize" style={{ color: PLAN_PURPLE_DARK }}>
          Сегодня
        </span>
        <br />
        <span className="text-text-secondary">{dayMonth}</span>
      </>
    )
  }

  if (isExam) {
    return (
      <>
        <span className="capitalize text-text-tertiary">Экзамен</span>
        <br />
        <span className="text-text-tertiary">{dayMonth}</span>
      </>
    )
  }

  return (
    <>
      <span className="capitalize text-text-tertiary">{weekday}</span>
      <br />
      <span className="text-text-tertiary">{dayMonth}</span>
    </>
  )
}

function StatusLabel({ day }: { day: PlanDayEntry }) {
  if (day.status === 'past-done') {
    return (
      <span className="inline-flex shrink-0 items-center justify-end gap-1 text-[12px] sm:text-[13px]" style={{ color: PLAN_GREEN }}>
        <CircleCheck size={15} strokeWidth={2} aria-hidden />
        <span className="hidden sm:inline">выполнено</span>
      </span>
    )
  }

  if (day.status === 'past-missed' || day.status === 'past-partial') {
    return (
      <span className="inline-flex shrink-0 items-center justify-end gap-1 text-[12px] sm:text-[13px]" style={{ color: PLAN_AMBER }}>
        <CircleX size={15} strokeWidth={2} aria-hidden />
        <span className="hidden sm:inline">{day.status === 'past-partial' ? 'частично' : 'пропущено'}</span>
      </span>
    )
  }

  if (day.status === 'today') {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-end gap-1 text-[12px] font-medium sm:text-[13px]"
        style={{ color: PLAN_PURPLE_DARK }}
      >
        <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
        <span className="hidden sm:inline">сейчас</span>
      </span>
    )
  }

  if (day.status === 'exam') {
    return <span className="shrink-0 text-right text-[13px] text-text-tertiary">—</span>
  }

  return <span className="shrink-0 text-right text-[13px] text-text-tertiary">план</span>
}
