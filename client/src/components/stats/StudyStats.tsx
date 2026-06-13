import { Check, Flame } from 'lucide-react'
import type { CSSProperties } from 'react'
import { pluralizeCards } from '../../lib/pluralizeRu'
import { StudyActivityCalendar } from './StudyActivityCalendar'
import { ModuleAchievements } from './ModuleAchievements'
import {
  statsCaptionClass,
  statsCardShellClass,
  statsLabelClass,
  statsMetricClass,
} from './statsStyles'

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

type DayStatus = 'done' | 'missed' | 'today' | 'future'

export interface StudyStatsProps {
  cardsDue?: number
  streakDays?: number
  progressPercent: number
  progressCaption?: string
  accentColor?: string
  layout?: 'wide' | 'compact'
  reviewsByDate?: Record<string, number>
  className?: string
}

function buildWeekDays(streakDays: number) {
  const todayIdx = (new Date().getDay() + 6) % 7

  return WEEK_LABELS.map((label, i) => {
    if (i > todayIdx) return { label, status: 'future' as DayStatus }
    if (i === todayIdx) return { label, status: 'today' as DayStatus }

    const daysAgo = todayIdx - i
    const isDone = daysAgo < streakDays
    return { label, status: (isDone ? 'done' : 'missed') as DayStatus }
  })
}

function pluralizeDays(count: number): string {
  const abs = Math.abs(count)
  const mod100 = abs % 100
  const mod10 = abs % 10

  if (mod100 >= 11 && mod100 <= 14) return 'дней'
  if (mod10 === 1) return 'день'
  if (mod10 >= 2 && mod10 <= 4) return 'дня'
  return 'дней'
}

function ProgressRing({
  value,
  accentColor = '#6366f1',
  size = 'default',
}: {
  value: number
  accentColor?: string
  size?: 'default' | 'large'
}) {
  const isLarge = size === 'large'
  const box = 124
  const radius = 48
  const stroke = 10
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const center = box / 2

  return (
    <div
      className={[
        'relative shrink-0',
        isLarge ? 'h-[108px] w-[108px] xl:h-[124px] xl:w-[124px]' : 'h-[108px] w-[108px]',
      ].join(' ')}
    >
      <svg viewBox={`0 0 ${box} ${box}`} className="h-full w-full -rotate-90" aria-hidden>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#eef0f4" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={[
            'font-semibold tabular-nums tracking-[-0.03em] text-text-primary',
            isLarge ? 'text-[22px] xl:text-[24px]' : 'text-[22px]',
          ].join(' ')}
        >
          {value}%
        </span>
      </div>
    </div>
  )
}

function StreakCard({ streakDays }: { streakDays: number }) {
  return (
    <article className="relative flex min-h-[168px] flex-col overflow-hidden rounded-[22px] border border-[#fde68a] bg-gradient-to-br from-[#fffbeb] via-[#fff8e6] to-[#ffedd5] px-4 py-4 xl:px-5 xl:py-5">
      <p className={`relative z-10 ${statsLabelClass}`}>Серия</p>
      <div className="relative z-10 mt-2 flex flex-1 flex-col items-center justify-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fbbf24]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            <Flame
              size={22}
              strokeWidth={2}
              className="fill-[#f97316] text-[#ea580c]"
              aria-hidden
            />
          </div>
          <span className={statsMetricClass}>{streakDays}</span>
        </div>
        <p className={`mt-2 text-center ${statsCaptionClass}`}>
          {pluralizeDays(streakDays)} подряд
        </p>
      </div>

      <div
        className="pointer-events-none absolute -bottom-10 -right-8 h-32 w-32 rounded-full bg-[#fbbf24]/25 blur-[1px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-2 right-12 h-20 w-20 rounded-full bg-[#f97316]/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-6 top-8 h-24 w-24 rounded-full bg-[#fde047]/20"
        aria-hidden
      />
    </article>
  )
}

function TodayCard({
  cardsDue,
  streakDays,
  accentColor = '#6366f1',
}: {
  cardsDue: number
  streakDays: number
  accentColor?: string
}) {
  const weekDays = buildWeekDays(streakDays)

  return (
    <article className={`min-h-[168px] ${statsCardShellClass}`}>
      <p className={statsLabelClass}>На сегодня</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className={statsMetricClass}>{cardsDue}</span>
        <span className={statsCaptionClass}>{pluralizeCards(cardsDue)} к повторению</span>
      </div>

      <div className="mt-auto grid grid-cols-7 gap-1.5 pt-4">
        {weekDays.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-1.5">
            <div
              className={[
                'flex h-9 w-full items-center justify-center rounded-xl transition-colors',
                day.status === 'today' && 'ring-2 ring-offset-1',
                day.status === 'done' && 'bg-[#ecfdf3] text-[#16a34a]',
                day.status === 'missed' && 'bg-[#fef2f2] text-[#ef4444]',
                day.status === 'future' && 'bg-surface-muted',
              ]
                .filter(Boolean)
                .join(' ')}
              style={
                day.status === 'today'
                  ? ({
                      backgroundColor: `${accentColor}14`,
                      '--tw-ring-color': `${accentColor}33`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {day.status === 'done' ? (
                <Check size={14} strokeWidth={2.5} aria-hidden />
              ) : day.status === 'missed' ? (
                <span className="text-[13px] font-semibold leading-none">!</span>
              ) : null}
            </div>
            <span
              className={[
                'text-[10px] tabular-nums',
                day.status === 'today' ? 'font-semibold' : 'text-text-tertiary',
              ].join(' ')}
              style={day.status === 'today' ? { color: accentColor } : undefined}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function ProgressCard({
  progressPercent,
  progressCaption,
  accentColor = '#6366f1',
  size = 'default',
}: {
  progressPercent: number
  progressCaption: string
  accentColor?: string
  size?: 'default' | 'large'
}) {
  return (
    <article className={`min-h-[168px] ${statsCardShellClass}`}>
      <p className={statsLabelClass}>Прогресс</p>
      <div className="mt-2 flex flex-1 items-center justify-center">
        <ProgressRing value={progressPercent} accentColor={accentColor} size={size} />
      </div>
      <p className={`mt-1 text-center ${statsCaptionClass}`}>{progressCaption}</p>
    </article>
  )
}

export function StudyStats({
  cardsDue = 0,
  streakDays = 0,
  progressPercent,
  progressCaption = 'по всем модулям',
  accentColor = '#6366f1',
  layout = 'wide',
  reviewsByDate,
  className = '',
}: StudyStatsProps) {
  const gridClass =
    layout === 'wide'
      ? 'grid grid-cols-1 gap-4 sm:grid-cols-[minmax(148px,168px)_minmax(0,1fr)_minmax(148px,168px)] sm:items-stretch'
      : 'grid grid-cols-1 gap-4'

  if (reviewsByDate) {
    return (
      <div
        className={[
          'grid grid-cols-1 gap-4',
          'sm:grid-cols-[minmax(148px,168px)_minmax(0,1fr)] sm:items-start',
          'xl:grid-cols-1',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <ProgressCard
          progressPercent={progressPercent}
          progressCaption={progressCaption}
          accentColor={accentColor}
          size="large"
        />
        <StudyActivityCalendar
          reviewsByDate={reviewsByDate}
          accentColor={accentColor}
          size="large"
        />
        <ModuleAchievements
          reviewsByDate={reviewsByDate}
          progressPercent={progressPercent}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>
    )
  }

  return (
    <div className={[gridClass, className].filter(Boolean).join(' ')}>
      <StreakCard streakDays={streakDays} />
      <TodayCard cardsDue={cardsDue} streakDays={streakDays} accentColor={accentColor} />
      <ProgressCard
        progressPercent={progressPercent}
        progressCaption={progressCaption}
        accentColor={accentColor}
        size="large"
      />
    </div>
  )
}
