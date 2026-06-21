import { ChevronLeft, ChevronRight, Play, RotateCcw, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useElementWidth } from '../../hooks/useElementWidth'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useAppSelector } from '../../store/hooks'
import { buildPlanCalendarMonth, listCalendarMonths } from '../../lib/examPlan'
import type { PlanCalendarDay, PlanDayEntry } from '../../types/examPlan'
import {
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
const CELL_CLASS = 'relative aspect-square w-full min-w-0'

/** Пороги по реальной ширине сетки календаря (не viewport). */
const WIDE_CALENDAR_PX = 540
const FULL_CALENDAR_PX = 640
/** Мин. ширина ячейки, чтобы влезли иконки нагрузки + кнопка «Начать». */
const TODAY_TEXT_BUTTON_MIN_CELL_PX = 112

const GRID_GAP_PX: Record<CalendarDensity, number> = {
  compact: 4,
  normal: 6,
  full: 8,
}

type CalendarDensity = 'compact' | 'normal' | 'full'

function calendarDensity(width: number): CalendarDensity {
  if (width <= 0) return 'normal'
  if (width < WIDE_CALENDAR_PX) return 'compact'
  if (width < FULL_CALENDAR_PX) return 'normal'
  return 'full'
}

const MOBILE_COLS = 4
const MOBILE_GAP_PX = 8

function estimateCellSize(gridWidth: number, cols: number, gapPx: number): number {
  if (gridWidth <= 0 || cols <= 0) return 0
  return (gridWidth - gapPx * (cols - 1)) / cols
}

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

function queueNewCount(entry: PlanDayEntry): number {
  return entry.remainingNew ?? entry.plannedNew
}

function queueReviewCount(entry: PlanDayEntry): number {
  return entry.remainingReviews ?? entry.plannedReviews
}

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
  const sectionRef = useRef<HTMLElement>(null)
  const { ref: gridMeasureRef, width: gridWidth, remeasure } = useElementWidth<HTMLDivElement>()
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed)

  const setSectionRef = useCallback((node: HTMLElement | null) => {
    sectionRef.current = node
  }, [])

  useEffect(() => {
    remeasure()
    const afterSidebarTransition = window.setTimeout(remeasure, 320)
    return () => window.clearTimeout(afterSidebarTransition)
  }, [sidebarCollapsed, remeasure])

  const density = calendarDensity(gridWidth)
  const isWide = density !== 'compact'
  const isFull = density === 'full'
  const isMobileLayout = useMediaQuery('(max-width: 639px)')
  const cellSize = isMobileLayout
    ? estimateCellSize(gridWidth, MOBILE_COLS, MOBILE_GAP_PX)
    : estimateCellSize(gridWidth, 7, GRID_GAP_PX[density])
  const todayTextMinCell = isMobileLayout ? 88 : TODAY_TEXT_BUTTON_MIN_CELL_PX
  const showTodayTextButton = cellSize >= todayTextMinCell

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

  const mobileDays = useMemo(
    () => weeks.flat().filter((day) => !day.isOutsideMonth),
    [weeks],
  )

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return null
    return days.find((d) => d.date === selectedDate) ?? null
  }, [days, selectedDate])

  const close = useCallback(() => setSelectedDate(null), [])

  useEffect(() => {
    if (!selectedDate) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (sectionRef.current?.contains(target)) {
        const popover = sectionRef.current.querySelector('[data-day-popover]')
        const cell = sectionRef.current.querySelector('[data-selected-cell="true"]')
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

  const gridGap = isFull ? 'gap-2' : isWide ? 'gap-1.5' : 'gap-1'

  const renderDayCell = (day: PlanCalendarDay, dayIndex: number, popoverColumnCount: number) => (
    <DayCell
      key={day.date}
      day={day}
      rangeFrom={rangeFrom}
      popoverOnLeft={dayIndex % popoverColumnCount >= Math.ceil(popoverColumnCount / 2)}
      density={density}
      isMobileLayout={isMobileLayout}
      showTodayTextButton={showTodayTextButton}
      selected={selectedDate === day.entry?.date}
      onSelect={() => {
        if (!day.entry) return
        setSelectedDate((prev) => (prev === day.entry!.date ? null : day.entry!.date))
      }}
      popoverEntry={selectedDate === day.entry?.date ? selectedEntry : null}
      onClose={close}
    />
  )

  return (
    <section ref={setSectionRef} className="w-full min-w-0">
      <div
        className={[
          'mb-4 flex gap-3',
          isWide ? 'flex-row items-center justify-between' : 'flex-col',
        ].join(' ')}
      >
        <h2 className={planSectionTitleClass}>Календарь</h2>
        {currentMonth && (
          <div className={['flex items-center gap-1', isWide ? 'justify-end' : 'justify-center'].join(' ')}>
            <NavBtn
              label="Предыдущий месяц"
              disabled={!canGoPrev}
              onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </NavBtn>
            <span
              className={[
                'min-w-0 flex-1 truncate px-1 text-center font-medium capitalize text-text-primary',
                isWide ? 'min-w-[10rem] flex-none px-2 text-[15px]' : 'text-[14px]',
              ].join(' ')}
            >
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

      <div ref={gridMeasureRef} className="w-full min-w-0">
        {isMobileLayout ? (
          <div className="grid grid-cols-4 gap-2">
            {mobileDays.map((day, index) => renderDayCell(day, index, MOBILE_COLS))}
          </div>
        ) : (
          <div className={['grid grid-cols-7', gridGap].join(' ')}>
            {WEEKDAYS.map((label) => (
              <span
                key={label}
                className={[
                  'text-center font-medium uppercase tracking-[0.04em] text-text-tertiary',
                  isWide ? 'pb-1 text-[12px]' : 'pb-0.5 text-[10px]',
                ].join(' ')}
              >
                {label}
              </span>
            ))}

            {weeks.flatMap((week) =>
              week.map((day, dayIndex) => renderDayCell(day, dayIndex, 7)),
            )}
          </div>
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
  popoverOnLeft,
  density,
  isMobileLayout,
  showTodayTextButton,
  selected,
  onSelect,
  popoverEntry,
  onClose,
}: {
  day: PlanCalendarDay
  rangeFrom: string
  popoverOnLeft: boolean
  density: CalendarDensity
  isMobileLayout: boolean
  showTodayTextButton: boolean
  selected: boolean
  onSelect: () => void
  popoverEntry: PlanDayEntry | null
  onClose: () => void
}) {
  const isWide = density !== 'compact' || isMobileLayout
  const isFull = density === 'full'

  if (day.isOutsideMonth) {
    return <div className={CELL_CLASS} aria-hidden />
  }

  const dayNum = new Date(`${day.date}T12:00:00`).getDate()
  const isPast = day.date < rangeFrom
  const entry = day.entry

  if (!entry) {
    return (
      <div
        className={`${CELL_CLASS} overflow-hidden rounded-lg border`}
        style={{
          backgroundColor: isPast ? PASTEL.pastBg : PASTEL.futureBg,
          borderColor: PASTEL.border,
          opacity: isPast ? 0.4 : 0.55,
        }}
        aria-hidden
      >
        <span className="p-2 text-[12px] tabular-nums text-text-tertiary">{dayNum}</span>
      </div>
    )
  }

  const styles = cellStyles(entry, isPast)
  const load = entry.status === 'exam' ? 0 : entry.totalPlanned
  const isToday = entry.status === 'today'

  return (
    <div className={CELL_CLASS} data-selected-cell={selected ? 'true' : undefined}>
      <div
        className={[
          'relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-lg border p-2 transition-colors',
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
          className={[
            'flex min-h-0 min-w-0 flex-1 cursor-pointer flex-col text-left',
            isToday && !showTodayTextButton ? 'pr-5' : '',
          ].join(' ')}
        >
          <span
            className={[
              'font-medium tabular-nums',
              isFull ? 'text-[14px]' : isWide ? 'text-[13px]' : 'text-[11px]',
            ].join(' ')}
            style={{ color: styles.dayNum }}
          >
            {dayNum}
          </span>

          {entry.status === 'exam' ? (
            <span
              className={[
                'mt-auto truncate font-medium uppercase tracking-wide',
                isFull ? 'text-[11px]' : isWide ? 'text-[10px]' : 'text-[9px]',
              ].join(' ')}
              style={{ color: PASTEL.examText }}
            >
              экзамен
            </span>
          ) : (
            <div className={['mt-auto min-w-0', isWide ? 'space-y-1' : 'space-y-0.5'].join(' ')}>
              {queueNewCount(entry) > 0 && (
                <span
                  className={[
                    'flex min-w-0 items-center tabular-nums',
                    isWide ? 'gap-1.5 text-[12px]' : 'gap-1 text-[10px]',
                    isFull ? 'text-[13px]' : '',
                  ].join(' ')}
                  style={{ color: PASTEL.muted }}
                  title={LABELS.todayNew}
                >
                  <Sparkles
                    className={isWide ? 'h-3.5 w-3.5 shrink-0' : 'h-[11px] w-[11px] shrink-0'}
                    strokeWidth={1.75}
                    style={{ color: PASTEL.new }}
                    aria-hidden
                  />
                  {queueNewCount(entry)}
                </span>
              )}
              {queueReviewCount(entry) > 0 && (
                <span
                  className={[
                    'flex min-w-0 items-center tabular-nums',
                    isWide ? 'gap-1.5 text-[12px]' : 'gap-1 text-[10px]',
                    isFull ? 'text-[13px]' : '',
                  ].join(' ')}
                  style={{ color: PASTEL.muted }}
                  title={LABELS.todayReviews}
                >
                  <RotateCcw
                    className={isWide ? 'h-3.5 w-3.5 shrink-0' : 'h-[11px] w-[11px] shrink-0'}
                    strokeWidth={1.75}
                    style={{ color: PASTEL.review }}
                    aria-hidden
                  />
                  {queueReviewCount(entry)}
                </span>
              )}
              {load === 0 && (
                <span className={isWide ? 'text-[12px] text-text-tertiary/70' : 'text-[10px] text-text-tertiary/70'}>
                  —
                </span>
              )}
            </div>
          )}
        </button>

        {isToday && (
          <>
            {!showTodayTextButton && (
              <Link
                to="/review"
                onClick={(e) => e.stopPropagation()}
                aria-label="Начать повторение"
                className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-md text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: PLAN_PURPLE }}
              >
                <Play size={11} strokeWidth={0} fill="currentColor" aria-hidden />
              </Link>
            )}
            {showTodayTextButton && (
              <Link
                to="/review"
                onClick={(e) => e.stopPropagation()}
                className={[
                  'mt-1 flex w-full shrink-0 items-center justify-center rounded-md font-medium text-white transition-opacity hover:opacity-90',
                  isFull ? 'py-1.5 text-[13px]' : 'py-1 text-[12px]',
                ].join(' ')}
                style={{ backgroundColor: PLAN_PURPLE }}
              >
                Начать
              </Link>
            )}
          </>
        )}
      </div>

      {popoverEntry && (
        <DayPopover
          entry={popoverEntry}
          onClose={onClose}
          popoverOnLeft={popoverOnLeft}
          docked={isMobileLayout}
        />
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
  docked,
}: {
  entry: PlanDayEntry
  onClose: () => void
  popoverOnLeft: boolean
  docked: boolean
}) {
  const d = new Date(`${entry.date}T12:00:00`)
  const title = d.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div
      data-day-popover
      role="dialog"
      aria-label={`Детали дня: ${title}`}
      className={[
        'z-50 max-h-[min(70vh,520px)] w-[min(280px,calc(100vw-2rem))] overflow-y-auto rounded-xl bg-white p-4 shadow-lg',
        docked
          ? 'fixed inset-x-4 top-[calc(4rem+0.625rem)] z-[60] w-auto max-h-[min(calc(100dvh-5.5rem),480px)]'
          : ['absolute top-0 mt-0', popoverOnLeft ? 'right-full mr-2' : 'left-full ml-2'].join(' '),
      ].join(' ')}
      style={{ border: `1px solid ${PASTEL.border}` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[14px] font-medium capitalize leading-snug text-text-primary">{title}</p>
          {entry.status !== 'exam' && (
            <p className={`mt-1 ${planCaptionClass}`}>
              {entry.status === 'today' && (entry.remainingNew != null || entry.remainingReviews != null)
                ? `${queueNewCount(entry)} ${PLAN_ICON_LABELS.firstStudyCount} · ${queueReviewCount(entry)} ${PLAN_ICON_LABELS.reviewDueCount} в очереди (план: ${entry.plannedNew} + ${entry.plannedReviews})`
                : `${entry.plannedNew} ${PLAN_ICON_LABELS.firstStudyCount} · ${entry.plannedReviews} ${PLAN_ICON_LABELS.reviewDueCount}`}
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

      {entry.moduleBreakdown && entry.moduleBreakdown.length > 0 && (
        <ul className="max-h-[120px] space-y-1 overflow-y-auto">
          {entry.moduleBreakdown.map((m) => (
            <li
              key={m.moduleId}
              className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[12px]"
              style={{ backgroundColor: PASTEL.pastBg }}
            >
              <span className="min-w-0 truncate text-text-secondary">{m.title}</span>
              <span className="flex shrink-0 items-center gap-2 tabular-nums text-text-tertiary">
                {m.new > 0 && (
                  <span className="flex items-center gap-1" title={LABELS.todayNew}>
                    <Sparkles
                      className="h-3 w-3 shrink-0"
                      strokeWidth={1.75}
                      style={{ color: PASTEL.new }}
                      aria-hidden
                    />
                    {m.new}
                  </span>
                )}
                {m.reviews > 0 && (
                  <span className="flex items-center gap-1" title={LABELS.todayReviews}>
                    <RotateCcw
                      className="h-3 w-3 shrink-0"
                      strokeWidth={1.75}
                      style={{ color: PASTEL.review }}
                      aria-hidden
                    />
                    {m.reviews}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {entry.status !== 'future' && entry.status !== 'exam' && (
        <p className={`mt-2 ${planCaptionClass}`}>
          Выполнено: {entry.totalActual} из {entry.totalPlanned}
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
