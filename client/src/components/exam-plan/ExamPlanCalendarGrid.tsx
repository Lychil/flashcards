import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildPlanCalendarMonth, listCalendarMonths } from '../../lib/examPlan'
import type { PlanCalendarDay, PlanDayEntry } from '../../types/examPlan'
import {
  estimateStudyMinutes,
  LABELS,
  PLAN_ICON_LABELS,
  PLAN_PURPLE,
  planCaptionClass,
  planSectionTitleClass,
} from './examPlanStyles'

interface ExamPlanCalendarGridProps {
  days: PlanDayEntry[]
  rangeFrom: string
  rangeTo: string
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const
const CELL_ICON = 14
const LEGEND_ICON = 14

/** Мягкая пастель — без резких акцентов */
const PASTEL = {
  border: '#e6e8ee',
  borderHover: '#d8dce4',
  todayBg: '#f3f2f8',
  todayBorder: '#d8d4ea',
  doneBg: '#f2f7f4',
  missedBg: '#f9f7f3',
  overloadBg: '#f8f5f7',
  examBg: '#f0eef5',
  futureBg: '#ffffff',
  pastBg: '#f7f8fa',
  muted: '#9aa3b2',
  new: '#9b93c9',
  review: '#8fa4b8',
  examText: '#7a7399',
} as const

function monthIndexForToday(months: { year: number; month: number }[]): number {
  const today = new Date()
  const idx = months.findIndex((m) => m.year === today.getFullYear() && m.month === today.getMonth())
  return idx >= 0 ? idx : 0
}

function formatMonthTitle(year: number, month: number): string {
  const label = new Date(year, month, 1, 12, 0, 0).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function ExamPlanCalendarGrid({ days, rangeFrom, rangeTo }: ExamPlanCalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const gridRef = useRef<HTMLElement>(null)

  const months = useMemo(() => listCalendarMonths(rangeFrom, rangeTo), [rangeFrom, rangeTo])
  const [monthIndex, setMonthIndex] = useState(() => monthIndexForToday(months))

  useEffect(() => {
    setMonthIndex(monthIndexForToday(months))
  }, [months])

  const weeks = useMemo(() => {
    if (months.length === 0) return []
    const { year, month } = months[monthIndex] ?? months[0]
    return buildPlanCalendarMonth(year, month, days, rangeFrom, rangeTo)
  }, [months, monthIndex, days, rangeFrom, rangeTo])

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null
    return days.find((d) => d.date === selectedDate) ?? null
  }, [days, selectedDate])

  const close = useCallback(() => setSelectedDate(null), [])

  useEffect(() => {
    if (!selectedDate) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (gridRef.current?.contains(target)) {
        const popover = gridRef.current.querySelector('[data-day-popover]')
        const cell = gridRef.current.querySelector('[data-selected-cell="true"]')
        if (popover?.contains(target) || cell?.contains(target)) return
      }
      close()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedDate, close])

  const currentMonth = months[monthIndex]
  const canGoPrev = monthIndex > 0
  const canGoNext = monthIndex < months.length - 1

  return (
    <section ref={gridRef} className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className={planSectionTitleClass}>Календарь</h2>
        <div className="flex items-center gap-3">
          {currentMonth && (
            <div className="flex items-center gap-1">
              <NavBtn
                label="Предыдущий месяц"
                disabled={!canGoPrev}
                onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
              >
                <ChevronLeft size={18} strokeWidth={1.75} />
              </NavBtn>
              <span className="min-w-[10rem] px-2 text-center text-[15px] font-medium capitalize text-text-primary">
                {formatMonthTitle(currentMonth.year, currentMonth.month)}
              </span>
              <NavBtn
                label="Следующий месяц"
                disabled={!canGoNext}
                onClick={() => setMonthIndex((i) => Math.min(months.length - 1, i + 1))}
              >
                <ChevronRight size={18} strokeWidth={1.75} />
              </NavBtn>
            </div>
          )}
        </div>
      </div>

      <p className={`mb-3 ${planCaptionClass}`}>
        <Sparkles size={LEGEND_ICON} className="mr-1 inline opacity-70" style={{ color: PASTEL.new }} aria-hidden />
        {PLAN_ICON_LABELS.firstStudyCount}
        <span className="mx-2 text-text-tertiary/50">·</span>
        <RotateCcw size={LEGEND_ICON} className="mr-1 inline opacity-70" style={{ color: PASTEL.review }} aria-hidden />
        {PLAN_ICON_LABELS.reviewDueCount}
      </p>

      <div className="grid w-full grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((label) => (
          <span
            key={label}
            className="pb-1 text-center text-[12px] font-medium uppercase tracking-[0.04em] text-text-tertiary"
          >
            {label}
          </span>
        ))}

        {weeks.flatMap((week) =>
          week.map((day, dayIndex) => (
            <DayCell
              key={day.date}
              day={day}
              rangeFrom={rangeFrom}
              dayIndex={dayIndex}
              selected={selectedDate === day.entry?.date}
              onSelect={() => {
                if (!day.entry) return
                setSelectedDate((prev) => (prev === day.entry!.date ? null : day.entry!.date))
              }}
              popoverEntry={selectedDate === day.entry?.date ? selectedEntry : null}
              onClose={close}
            />
          )),
        )}
      </div>
    </section>
  )
}

function NavBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-secondary disabled:cursor-not-allowed disabled:opacity-25"
    >
      {children}
    </button>
  )
}

function DayCell({
  day,
  rangeFrom,
  dayIndex,
  selected,
  onSelect,
  popoverEntry,
  onClose,
}: {
  day: PlanCalendarDay
  rangeFrom: string
  dayIndex: number
  selected: boolean
  onSelect: () => void
  popoverEntry: PlanDayEntry | null
  onClose: () => void
}) {
  if (day.isOutsideMonth) {
    return <div className="aspect-square min-h-[4.25rem] sm:min-h-[5rem]" aria-hidden />
  }

  const dayNum = new Date(`${day.date}T12:00:00`).getDate()
  const isPast = day.date < rangeFrom
  const entry = day.entry

  if (!entry) {
    return (
      <div
        className="aspect-square min-h-[4.25rem] rounded-lg border sm:min-h-[5rem]"
        style={{
          backgroundColor: isPast ? PASTEL.pastBg : PASTEL.futureBg,
          borderColor: PASTEL.border,
          opacity: isPast ? 0.4 : 0.55,
        }}
        aria-hidden
      >
        <span className="p-2 text-[13px] tabular-nums text-text-tertiary">{dayNum}</span>
      </div>
    )
  }

  const popoverOnLeft = dayIndex >= 4
  const styles = cellStyles(entry, isPast)
  const load = entry.status === 'exam' ? 0 : entry.totalPlanned
  const isToday = entry.status === 'today'

  return (
    <div
      className={[
        'relative aspect-square min-h-[4.25rem] sm:min-h-[5rem]',
        isToday ? 'min-h-[5.75rem] sm:min-h-[6.5rem]' : '',
      ].join(' ')}
      data-selected-cell={selected ? 'true' : undefined}
    >
      <div
        className={[
          'flex h-full w-full flex-col rounded-lg border p-2 transition-colors',
          selected ? 'border-[#d4d0e4]' : '',
          isPast ? 'opacity-50' : '',
        ].join(' ')}
        style={{
          backgroundColor: styles.bg,
          borderColor: selected ? PASTEL.todayBorder : styles.border,
        }}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-h-0 flex-1 cursor-pointer flex-col text-left"
        >
          <span
            className="text-[13px] font-medium tabular-nums sm:text-[14px]"
            style={{ color: styles.dayNum }}
          >
            {dayNum}
          </span>

          {entry.status === 'exam' ? (
            <span
              className="mt-auto text-[10px] font-medium uppercase tracking-wide sm:text-[11px]"
              style={{ color: PASTEL.examText }}
            >
              экзамен
            </span>
          ) : (
            <div className="mt-auto space-y-1">
              {entry.plannedNew > 0 && (
                <span
                  className="flex items-center gap-1.5 text-[12px] tabular-nums sm:text-[13px]"
                  style={{ color: PASTEL.muted }}
                  title={LABELS.todayNew}
                >
                  <Sparkles size={CELL_ICON} strokeWidth={1.75} style={{ color: PASTEL.new }} aria-hidden />
                  {entry.plannedNew}
                </span>
              )}
              {entry.plannedReviews > 0 && (
                <span
                  className="flex items-center gap-1.5 text-[12px] tabular-nums sm:text-[13px]"
                  style={{ color: PASTEL.muted }}
                  title={LABELS.todayReviews}
                >
                  <RotateCcw size={CELL_ICON} strokeWidth={1.75} style={{ color: PASTEL.review }} aria-hidden />
                  {entry.plannedReviews}
                </span>
              )}
              {load === 0 && (
                <span className="text-[12px] text-text-tertiary/70">—</span>
              )}
            </div>
          )}
        </button>

        {isToday && (
          <Link
            to="/review"
            onClick={(e) => e.stopPropagation()}
            className="mt-1.5 flex w-full items-center justify-center rounded-md py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 sm:text-[13px]"
            style={{ backgroundColor: PLAN_PURPLE }}
          >
            Начать
          </Link>
        )}
      </div>

      {popoverEntry && (
        <DayPopover entry={popoverEntry} onClose={onClose} popoverOnLeft={popoverOnLeft} />
      )}
    </div>
  )
}

function cellStyles(entry: PlanDayEntry, isPast: boolean) {
  if (entry.status === 'exam') {
    return { bg: PASTEL.examBg, border: PASTEL.border, dayNum: PASTEL.examText }
  }
  if (entry.status === 'today') {
    return { bg: PASTEL.todayBg, border: PASTEL.todayBorder, dayNum: PASTEL.examText }
  }
  if (entry.status === 'past-done') {
    return { bg: PASTEL.doneBg, border: PASTEL.border, dayNum: '#6b7280' }
  }
  if (entry.status === 'past-missed' || entry.status === 'past-partial') {
    return { bg: PASTEL.missedBg, border: PASTEL.border, dayNum: '#6b7280' }
  }
  if (entry.isOverloaded) {
    return { bg: PASTEL.overloadBg, border: PASTEL.border, dayNum: '#6b7280' }
  }
  if (isPast) {
    return { bg: PASTEL.pastBg, border: PASTEL.border, dayNum: '#9aa3b2' }
  }
  return { bg: PASTEL.futureBg, border: PASTEL.border, dayNum: '#4b5563' }
}

function DayPopover({
  entry,
  onClose,
  popoverOnLeft,
}: {
  entry: PlanDayEntry
  onClose: () => void
  popoverOnLeft: boolean
}) {
  const d = new Date(`${entry.date}T12:00:00`)
  const title = d.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const minutes = estimateStudyMinutes(entry.totalPlanned)

  return (
    <div
      data-day-popover
      role="dialog"
      aria-label={`Детали дня: ${title}`}
      className={[
        'absolute z-50 w-[min(280px,calc(100vw-2rem))] rounded-xl bg-white p-4',
        'max-sm:left-1/2 max-sm:top-full max-sm:mt-2 max-sm:-translate-x-1/2',
        'sm:top-0 sm:translate-x-0 sm:mt-0',
        popoverOnLeft ? 'sm:right-full sm:mr-2' : 'sm:left-full sm:ml-2',
      ].join(' ')}
      style={{ border: `1px solid ${PASTEL.border}` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-medium capitalize leading-snug text-text-primary">{title}</p>
          {entry.status !== 'exam' && (
            <p className={`mt-1 ${planCaptionClass}`}>
              {entry.plannedNew} {PLAN_ICON_LABELS.firstStudyCount} · {entry.plannedReviews}{' '}
              {PLAN_ICON_LABELS.reviewDueCount} · ≈ {minutes} мин
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-surface-subtle"
          aria-label="Закрыть"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {entry.carryoverFromYesterday != null && entry.carryoverFromYesterday > 0 && (
        <p className={`mb-2 ${planCaptionClass}`}>
          +{entry.carryoverFromYesterday} с прошлого дня
        </p>
      )}

      {entry.moduleBreakdown && entry.moduleBreakdown.length > 0 && (
        <ul className="max-h-[120px] space-y-1 overflow-y-auto">
          {entry.moduleBreakdown.map((m) => (
            <li
              key={m.moduleId}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[12px]"
              style={{ backgroundColor: PASTEL.pastBg }}
            >
              <span className="min-w-0 truncate text-text-secondary">{m.title}</span>
              <span className="flex shrink-0 gap-2 tabular-nums text-text-tertiary">
                {m.new > 0 && <span>{m.new} н</span>}
                {m.reviews > 0 && <span>{m.reviews} п</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {entry.status !== 'future' && entry.status !== 'exam' && (
        <p className={`mt-2 ${planCaptionClass}`}>
          Факт: {entry.totalActual} / {entry.totalPlanned}
        </p>
      )}

      {entry.status === 'exam' && (
        <p className={`mt-2 ${planCaptionClass}`}>
          Прогноз готовности: {entry.readinessPercent}%
        </p>
      )}
    </div>
  )
}
