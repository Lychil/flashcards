import { Check, Flame, Layers } from 'lucide-react'
import { pluralizeCards } from '../../lib/pluralizeRu'
import { homeCardClass, homeLabelClass } from './homeStyles'

interface HomeStatsProps {
  cardsDue: number
  streakDays: number
  averageProgress: number
}

const WEEK_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

type DayStatus = 'done' | 'missed' | 'today' | 'future'

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

function ProgressRing({ value }: { value: number }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg
        viewBox="0 0 108 108"
        className="h-full w-full -rotate-90"
        aria-hidden
      >
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="#eef0f4"
          strokeWidth="9"
        />
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="#6366f1"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-semibold tabular-nums tracking-[-0.03em] text-text-primary">
          {value}%
        </span>
      </div>
    </div>
  )
}

function StreakCard({ streakDays }: { streakDays: number }) {
  return (
    <article className="relative flex min-h-[152px] flex-col overflow-hidden rounded-[22px] border border-[#fde8a8] bg-[#fff8e6] px-4 py-4">
      <div className="relative z-10">
        <p className={homeLabelClass}>Серия</p>
        <div className="mt-1 flex items-center gap-1.5">
          <Flame size={18} strokeWidth={2} className="text-[#f59e0b]" aria-hidden />
          <span className="text-[34px] font-semibold tabular-nums leading-none tracking-[-0.04em] text-text-primary">
            {streakDays}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-text-secondary">
          {pluralizeDays(streakDays)} подряд
        </p>
      </div>

      <div
        className="pointer-events-none absolute -bottom-8 -right-6 h-28 w-28 rounded-full bg-[#fde047]/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-10 h-16 w-16 rounded-full bg-[#fbbf24]/20"
        aria-hidden
      />
    </article>
  )
}

function TodayCard({
  cardsDue,
  streakDays,
}: {
  cardsDue: number
  streakDays: number
}) {
  const weekDays = buildWeekDays(streakDays)

  return (
    <article className={`flex min-h-[152px] flex-col px-4 py-4 ${homeCardClass}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={homeLabelClass}>На сегодня</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[34px] font-semibold tabular-nums leading-none tracking-[-0.04em] text-text-primary">
              {cardsDue}
            </span>
            <span className="text-[13px] text-text-secondary">
              {pluralizeCards(cardsDue)} к повторению
            </span>
          </div>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ff]">
          <Layers size={17} strokeWidth={1.75} className="text-[#6366f1]" aria-hidden />
        </div>
      </div>

      <div className="mt-auto grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-1.5">
            <div
              className={[
                'flex h-9 w-full items-center justify-center rounded-xl transition-colors',
                day.status === 'today' &&
                  'bg-[#eef2ff] ring-2 ring-[#6366f1]/20 ring-offset-1',
                day.status === 'done' && 'bg-[#ecfdf3] text-[#16a34a]',
                day.status === 'missed' && 'bg-[#fef2f2] text-[#ef4444]',
                day.status === 'future' && 'bg-surface-muted',
              ]
                .filter(Boolean)
                .join(' ')}
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
                day.status === 'today' ? 'font-semibold text-[#6366f1]' : 'text-text-tertiary',
              ].join(' ')}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function ProgressCard({ averageProgress }: { averageProgress: number }) {
  return (
    <article className={`flex min-h-[152px] flex-col px-4 py-4 ${homeCardClass}`}>
      <p className={homeLabelClass}>Прогресс</p>
      <div className="mt-2 flex flex-1 items-center justify-center">
        <ProgressRing value={averageProgress} />
      </div>
      <p className="mt-1 text-center text-[12px] text-text-secondary">по всем модулям</p>
    </article>
  )
}

export function HomeStats({ cardsDue, streakDays, averageProgress }: HomeStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[720px]:grid-cols-[minmax(148px,168px)_1fr_minmax(148px,168px)]">
      <StreakCard streakDays={streakDays} />
      <TodayCard cardsDue={cardsDue} streakDays={streakDays} />
      <ProgressCard averageProgress={averageProgress} />
    </div>
  )
}
