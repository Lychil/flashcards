import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import {
  BoneMonkeyBadge,
  CalendarMonkeyBadge,
  CoffeeMonkeyBadge,
  GhostMonkeyBadge,
  NightMonkeyBadge,
  TrophyMonkeyBadge,
} from './achievementBadgeArt'
import { moduleInteractiveClass } from '../module/moduleStyles'

interface AchievementDef {
  id: string
  title: string
  description: string
  lockedHint: string
  ringColor: string
  innerBg: string
  Art: typeof CoffeeMonkeyBadge
  isUnlocked: (ctx: AchievementContext) => boolean
}

interface AchievementContext {
  totalReviews: number
  activeDays: number
  progressPercent: number
  maxReviewsInDay: number
}

interface ModuleAchievementsProps {
  reviewsByDate: Record<string, number>
  progressPercent: number
  className?: string
}

const VISIBLE_COUNT = 3

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-review',
    title: 'Первый таб',
    description: 'Хотя бы одно повторение',
    lockedHint: 'Откройте карточку и не закройте сразу',
    ringColor: '#FDE68A',
    innerBg: '#FBCFE8',
    Art: CoffeeMonkeyBadge,
    isUnlocked: (ctx) => ctx.totalReviews >= 1,
  },
  {
    id: 'bone-dry',
    title: 'Костоправ',
    description: '10 повторений в модуле',
    lockedHint: 'Нужно 10 повторений',
    ringColor: '#C7D2FE',
    innerBg: '#FEF08A',
    Art: BoneMonkeyBadge,
    isUnlocked: (ctx) => ctx.totalReviews >= 10,
  },
  {
    id: 'calendar-hero',
    title: 'Стажёр недели',
    description: '3 дня с повторениями',
    lockedHint: 'Заходите три разных дня',
    ringColor: '#BFDBFE',
    innerBg: '#BAE6FD',
    Art: CalendarMonkeyBadge,
    isUnlocked: (ctx) => ctx.activeDays >= 3,
  },
  {
    id: 'exam-mood',
    title: 'На экзамен точно',
    description: 'Усвоено больше 50%',
    lockedHint: 'Доведите прогресс до 50%',
    ringColor: '#BFDBFE',
    innerBg: '#FBCFE8',
    Art: TrophyMonkeyBadge,
    isUnlocked: (ctx) => ctx.progressPercent >= 50,
  },
  {
    id: 'night-owl',
    title: 'Повтор в 3 ночи',
    description: 'Легендарная прокрастинация',
    lockedHint: 'Скоро. Мы не следим, честно',
    ringColor: '#C7D2FE',
    innerBg: '#312E81',
    Art: NightMonkeyBadge,
    isUnlocked: () => false,
  },
  {
    id: 'ghost-mode',
    title: 'Призрак Anki',
    description: '100 повторений за день',
    lockedHint: '100 повторений за один день',
    ringColor: '#BFDBFE',
    innerBg: '#FECDD3',
    Art: GhostMonkeyBadge,
    isUnlocked: (ctx) => ctx.maxReviewsInDay >= 100,
  },
]

function buildContext(
  reviewsByDate: Record<string, number>,
  progressPercent: number,
): AchievementContext {
  const counts = Object.values(reviewsByDate)
  return {
    totalReviews: counts.reduce((sum, count) => sum + count, 0),
    activeDays: counts.filter((count) => count > 0).length,
    progressPercent,
    maxReviewsInDay: counts.length > 0 ? Math.max(...counts) : 0,
  }
}

export function ModuleAchievements({
  reviewsByDate,
  progressPercent,
  className = '',
}: ModuleAchievementsProps) {
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)
  const ctx = useMemo(
    () => buildContext(reviewsByDate, progressPercent),
    [reviewsByDate, progressPercent],
  )

  const unlockedCount = ACHIEVEMENTS.filter((item) => item.isUnlocked(ctx)).length
  const maxPage = Math.max(0, Math.ceil(ACHIEVEMENTS.length / VISIBLE_COUNT) - 1)
  const visible = ACHIEVEMENTS.slice(page * VISIBLE_COUNT, page * VISIBLE_COUNT + VISIBLE_COUNT)

  const goPrev = () => setPage((p) => Math.max(0, p - 1))
  const goNext = () => setPage((p) => Math.min(maxPage, p + 1))

  useEffect(() => {
    setOpenId(null)
  }, [page])

  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="text-[15px] font-bold tracking-[-0.02em] text-text-primary">Достижения</h3>
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#1E3A5F] px-1 text-[11px] font-bold tabular-nums text-white">
            {unlockedCount}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <CarouselButton label="Предыдущие" onClick={goPrev} disabled={page === 0}>
            <ChevronLeft size={16} strokeWidth={2} />
          </CarouselButton>
          <CarouselButton label="Следующие" onClick={goNext} disabled={page >= maxPage}>
            <ChevronRight size={16} strokeWidth={2} />
          </CarouselButton>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {visible.map((item) => {
          const unlocked = item.isUnlocked(ctx)
          const Art = item.Art

          return (
            <AchievementBadge
              key={item.id}
              title={item.title}
              ringColor={item.ringColor}
              innerBg={item.innerBg}
              muted={!unlocked}
              hintText={unlocked ? item.description : item.lockedHint}
              hintOpen={openId === item.id}
              onHintOpenChange={(open) => setOpenId(open ? item.id : null)}
            >
              <Art muted={!unlocked} />
            </AchievementBadge>
          )
        })}
      </div>
    </section>
  )
}

function AchievementBadge({
  title,
  ringColor,
  innerBg,
  muted,
  hintText,
  hintOpen,
  onHintOpenChange,
  children,
}: {
  title: string
  ringColor: string
  innerBg: string
  muted: boolean
  hintText: string
  hintOpen: boolean
  onHintOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const tooltipId = useId()

  useEffect(() => {
    if (!hintOpen) return undefined

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        onHintOpenChange(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onHintOpenChange(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [hintOpen, onHintOpenChange])

  return (
    <div ref={rootRef} className="relative flex flex-col items-center">
      {hintOpen && <AchievementBadgeHint anchorRef={rootRef} text={hintText} tooltipId={tooltipId} />}

      <button
        type="button"
        aria-expanded={hintOpen}
        aria-describedby={hintOpen ? tooltipId : undefined}
        onClick={() => onHintOpenChange(!hintOpen)}
        className={[
          'flex cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-left',
          moduleInteractiveClass,
        ].join(' ')}
      >
        <div
          className={[
            'flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-[#E2E8F0] bg-white p-[2px]',
            muted ? 'grayscale opacity-55' : '',
          ].join(' ')}
        >
          <div
            className="flex h-full w-full items-center justify-center rounded-full p-[5px]"
            style={{ backgroundColor: ringColor }}
          >
            <div
              className="flex h-full w-full items-center justify-center overflow-hidden rounded-full p-1.5"
              style={{ backgroundColor: innerBg }}
            >
              {children}
            </div>
          </div>
        </div>
        <p className="mt-2 max-w-[76px] text-center text-[11px] font-bold leading-[1.2] text-text-primary">
          {title}
        </p>
      </button>
    </div>
  )
}

function AchievementBadgeHint({
  anchorRef,
  text,
  tooltipId,
}: {
  anchorRef: RefObject<HTMLDivElement | null>
  text: string
  tooltipId: string
}) {
  const [style, setStyle] = useState<CSSProperties>({})

  const updatePosition = () => {
    const el = anchorRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    setStyle({
      position: 'fixed',
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
      zIndex: 99999,
    })
  }

  useLayoutEffect(() => {
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [anchorRef])

  return createPortal(
    <div
      id={tooltipId}
      role="tooltip"
      style={style}
      className="pointer-events-none w-max max-w-[220px] rounded-xl bg-[#12151a] px-3 py-2.5 text-[12px] font-medium leading-snug text-white"
    >
      {text}
    </div>,
    document.body,
  )
}

function CarouselButton({
  children,
  label,
  onClick,
  disabled = false,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white',
        moduleInteractiveClass,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
