import { useMemo } from 'react'
import {
  formatActivityDate,
  formatActivityMonth,
  getContributionLevel,
  getCurrentMonthContributionWeeks,
} from '../../lib/moduleStudyActivity'
import { pluralizeCards } from '../../lib/pluralizeRu'
import {
  statsCaptionClass,
  statsCardPaddingClass,
  statsCardClass,
  statsLabelClass,
} from './statsStyles'

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

interface StudyActivityCalendarProps {
  reviewsByDate: Record<string, number>
  accentColor?: string
  size?: 'default' | 'large'
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

function levelColor(
  level: 0 | 1 | 2 | 3 | 4,
  accentColor: string,
  isFuture: boolean,
  isOutsideMonth: boolean,
): string {
  if (isOutsideMonth) return 'transparent'
  if (isFuture) return '#f0f2f5'
  if (level === 0) return '#ebedf2'

  const { r, g, b } = hexToRgb(accentColor)
  const opacity = [0, 0.28, 0.48, 0.68, 0.92][level]
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function StudyActivityCalendar({
  reviewsByDate,
  accentColor = '#6366f1',
  size = 'default',
}: StudyActivityCalendarProps) {
  const isLarge = size === 'large'
  const gapClass = isLarge ? 'gap-2 max-xl:gap-1.5' : 'gap-1.5'
  const labelTextClass = isLarge ? 'text-[10px]' : 'text-[9px]'
  const legendCellClass = isLarge ? 'h-3.5 w-3.5' : 'h-3 w-3'
  const cellClass = isLarge
    ? 'h-[11px] w-[11px] rounded-[3px] xl:aspect-square xl:h-auto xl:w-full xl:rounded-[4px]'
    : 'h-[11px] w-[11px] rounded-[3px]'
  const monthLabel = useMemo(() => formatActivityMonth(), [])
  const weeks = useMemo(() => getCurrentMonthContributionWeeks(reviewsByDate), [reviewsByDate])

  const maxCount = useMemo(() => {
    let max = 0
    for (const week of weeks) {
      for (const day of week) {
        if (!day.isFuture && !day.isOutsideMonth) max = Math.max(max, day.count)
      }
    }
    return max
  }, [weeks])

  const activeDays = useMemo(
    () =>
      weeks.reduce(
        (sum, week) =>
          sum + week.filter((day) => !day.isFuture && !day.isOutsideMonth && day.count > 0).length,
        0,
      ),
    [weeks],
  )

  return (
    <article className={['flex flex-col', statsCardPaddingClass, statsCardClass].join(' ')}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className={statsLabelClass}>Активность</p>
          <p className={`mt-1 ${statsCaptionClass}`}>{monthLabel}</p>
        </div>
        <p className={`shrink-0 ${statsCaptionClass}`}>
          {activeDays > 0 ? `${activeDays} дн. с повторениями` : 'Пока без повторений'}
        </p>
      </div>

      <div
        className={[
          'grid w-fit max-w-full pb-1',
          gapClass,
          isLarge ? 'mx-auto pt-0.5 xl:mx-0 xl:w-full' : '',
          isLarge
            ? 'grid-cols-[repeat(7,auto)] xl:grid-cols-[repeat(7,minmax(0,1fr))]'
            : 'grid-cols-[repeat(7,auto)]',
        ].join(' ')}
      >
        {WEEKDAY_LABELS.map((label, colIndex) => (
          <span
            key={label}
            className={[
              'flex items-center justify-center pb-0.5 leading-none text-text-tertiary',
              labelTextClass,
            ].join(' ')}
            style={{ gridColumn: colIndex + 1, gridRow: 1 }}
          >
            {label}
          </span>
        ))}

        {weeks.flatMap((week, weekIndex) =>
          week.map((day, dayIndex) => {
            const cellStyle = {
              gridColumn: dayIndex + 1,
              gridRow: weekIndex + 2,
            }

            if (day.isOutsideMonth) {
              return (
                <div
                  key={day.date}
                  aria-hidden
                  style={cellStyle}
                  className={[cellClass, 'min-h-0 min-w-0'].join(' ')}
                />
              )
            }

            const level = day.isFuture ? 0 : getContributionLevel(day.count, maxCount)
            const title = day.isFuture
              ? formatActivityDate(day.date)
              : `${formatActivityDate(day.date)}: ${day.count} ${pluralizeCards(day.count)}`

            return (
              <div
                key={day.date}
                title={title}
                className={[cellClass, 'min-h-0 min-w-0'].join(' ')}
                style={{
                  ...cellStyle,
                  backgroundColor: levelColor(level, accentColor, day.isFuture, false),
                }}
              />
            )
          }),
        )}
      </div>

      <div
        className={[
          'mt-3 flex items-center justify-end gap-1.5 text-text-tertiary',
          isLarge ? 'text-[11px]' : 'text-[10px]',
        ].join(' ')}
      >
        <span>Меньше</span>
        <div className={`flex ${gapClass}`}>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <div
              key={level}
              className={`rounded-[3px] ${legendCellClass}`}
              style={{ backgroundColor: levelColor(level, accentColor, false, false) }}
            />
          ))}
        </div>
        <span>Больше</span>
      </div>
    </article>
  )
}
