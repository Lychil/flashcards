import { useMemo, type CSSProperties } from 'react'
import { formatActivityDate } from '../../lib/moduleStudyActivity'
import { pluralizeCards } from '../../lib/pluralizeRu'
import type { PlanCalendarWeek, PlanDayEntry } from '../../types/examPlan'
import {
  statsCaptionClass,
  statsCardClass,
  statsCardPaddingClass,
  statsLabelClass,
} from '../stats/statsStyles'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

interface ExamPlanCalendarProps {
  weeks: PlanCalendarWeek[]
  rangeStart?: string
  accentColor?: string
  /** Без карточки stats — для встраивания в страницу плана */
  plain?: boolean
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

function loadLevel(total: number, maxLoad: number): 0 | 1 | 2 | 3 | 4 {
  if (total <= 0) return 0
  if (maxLoad <= 1) return 4
  const ratio = total / maxLoad
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

function dayColor(
  entry: PlanDayEntry | null,
  level: 0 | 1 | 2 | 3 | 4,
  accentColor: string,
  isOutsideRange: boolean,
): string {
  if (isOutsideRange) return 'transparent'
  if (!entry) return '#f0f2f5'

  if (entry.status === 'exam') return '#0a1225'

  if (entry.status === 'past-done') {
    const { r, g, b } = hexToRgb('#6BC9A7')
    return `rgba(${r}, ${g}, ${b}, 0.85)`
  }
  if (entry.status === 'past-partial') {
    const { r, g, b } = hexToRgb('#F5B84C')
    return `rgba(${r}, ${g}, ${b}, 0.7)`
  }
  if (entry.status === 'past-missed') {
    return '#fecaca'
  }

  if (entry.status === 'future' || entry.status === 'today') {
    if (level === 0) return '#ebedf2'
    const { r, g, b } = hexToRgb(entry.isOverloaded ? '#E879A9' : accentColor)
    const opacity = entry.isOverloaded
      ? [0, 0.35, 0.55, 0.75, 0.95][level]
      : [0, 0.28, 0.48, 0.68, 0.92][level]
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return '#ebedf2'
}

function dayTitle(entry: PlanDayEntry | null, date: string): string {
  if (!entry) return formatActivityDate(date)
  if (entry.status === 'exam') return `${formatActivityDate(date)} — экзамен`

  const parts = [
    formatActivityDate(date),
    `план: ${entry.plannedNew} новых + ${entry.plannedReviews} повторений`,
  ]

  if (entry.status === 'past-done' || entry.status === 'past-partial' || entry.status === 'past-missed') {
    parts.push(`факт: ${entry.totalActual} ${pluralizeCards(entry.totalActual)}`)
  }

  if (entry.isOverloaded) parts.push('перегрузка из-за отставания')

  return parts.join(' · ')
}

function formatShortDate(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function ExamPlanCalendar({
  weeks,
  rangeStart,
  accentColor = '#5B9FD4',
  plain = false,
}: ExamPlanCalendarProps) {
  const maxLoad = useMemo(() => {
    let max = 1
    for (const week of weeks) {
      for (const day of week) {
        if (day.entry && day.entry.status !== 'exam') {
          max = Math.max(max, day.entry.totalPlanned)
        }
      }
    }
    return max
  }, [weeks])

  const cellClass = plain
    ? 'h-[13px] w-[13px] rounded-[4px] sm:h-[14px] sm:w-[14px] xl:aspect-square xl:h-auto xl:w-full xl:min-h-[18px] xl:rounded-[5px]'
    : 'h-[11px] w-[11px] rounded-[3px] xl:aspect-square xl:h-auto xl:w-full xl:rounded-[4px] min-h-0 min-w-0'

  const shellClass = plain
    ? 'flex flex-col'
    : ['flex flex-col', statsCardPaddingClass, statsCardClass].join(' ')

  return (
    <article className={shellClass}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={statsLabelClass}>Календарь подготовки</p>
          <p className={`mt-1 ${statsCaptionClass}`}>
            {rangeStart
              ? `С ${formatShortDate(rangeStart)} до экзамена`
              : 'От сегодня до экзамена'}
          </p>
        </div>
        <div className={`flex flex-wrap gap-x-3 gap-y-1 ${statsCaptionClass}`}>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#6BC9A7]/85" />
            выполнено
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#fecaca]" />
            пропущено
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-[2px] ring-2 ring-offset-1"
              style={{ backgroundColor: `${accentColor}66`, '--tw-ring-color': accentColor } as React.CSSProperties}
            />
            сегодня
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className={[
            'grid w-fit max-w-full gap-2 max-xl:gap-1.5',
            'grid-cols-[repeat(7,auto)] xl:grid-cols-[repeat(7,minmax(0,1fr))] xl:w-full',
          ].join(' ')}
        >
          {WEEKDAY_LABELS.map((label, colIndex) => (
            <span
              key={label}
              className="flex items-center justify-center pb-0.5 text-[10px] leading-none text-text-tertiary"
              style={{ gridColumn: colIndex + 1, gridRow: 1 }}
            >
              {label}
            </span>
          ))}

          {weeks.flatMap((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const cellStyle = { gridColumn: dayIndex + 1, gridRow: weekIndex + 2 }
              const entry = day.entry
              const level =
                entry && entry.status !== 'exam'
                  ? loadLevel(entry.totalPlanned, maxLoad)
                  : 0
              const isToday = entry?.status === 'today'

              if (day.isOutsideRange) {
                return <div key={day.date} aria-hidden style={cellStyle} className={cellClass} />
              }

              const bg = dayColor(entry, level, accentColor, false)

              return (
                <div
                  key={day.date}
                  title={dayTitle(entry, day.date)}
                  style={{
                    ...cellStyle,
                    backgroundColor: bg,
                    ...(isToday ? ({ '--tw-ring-color': accentColor } as CSSProperties) : {}),
                  }}
                  className={[
                    cellClass,
                    isToday ? 'ring-2 ring-offset-1' : '',
                    entry?.status === 'exam' ? 'relative z-10' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )
            }),
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-text-tertiary">
        <span>Меньше</span>
        <div className="flex gap-1.5">
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <div
              key={level}
              className="h-3 w-3 rounded-[3px]"
              style={{
                backgroundColor: dayColor(
                  { status: 'future', totalPlanned: level, isOverloaded: false } as PlanDayEntry,
                  level,
                  accentColor,
                  false,
                ),
              }}
            />
          ))}
        </div>
        <span>Больше</span>
      </div>
    </article>
  )
}
