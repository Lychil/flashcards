import { Crown, Lock } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { pluralizeCards } from '../../lib/pluralizeRu'
import {
  STUDY_MODE_GROUPS,
  STUDY_MODES,
  type StudyModeGroup,
  type StudyModeId,
  type StudyModeOption,
} from '../../types/studyMode'
import { moduleInteractiveClass, moduleLabelClass } from './moduleStyles'

interface StudyModeGridProps {
  sessionCardCount: number
  categoryEmpty: boolean
  isPremiumUser?: boolean
  onSelect: (mode: StudyModeId) => void
  onEmptyCategory: () => void
  variant?: 'default' | 'sidebar' | 'hub'
  className?: string
}

export function StudyModeGrid({
  sessionCardCount,
  categoryEmpty,
  isPremiumUser = false,
  onSelect,
  onEmptyCategory,
  variant = 'default',
  className = '',
}: StudyModeGridProps) {
  const [openHintId, setOpenHintId] = useState<StudyModeId | null>(null)
  const rowLayout = variant === 'hub'

  const renderModeTile = (mode: StudyModeOption) => (
    <ModeTile
      key={mode.id}
      mode={mode}
      sessionCardCount={sessionCardCount}
      categoryEmpty={categoryEmpty}
      isPremiumUser={isPremiumUser}
      hintOpen={openHintId === mode.id}
      onHintOpenChange={(open) => setOpenHintId(open ? mode.id : null)}
      onSelect={onSelect}
      onEmptyCategory={onEmptyCategory}
    />
  )

  return (
    <div className={['space-y-5', className].filter(Boolean).join(' ')}>
      {(variant === 'sidebar' || variant === 'hub') && (
        <h2
          className={[
            'text-text-primary',
            variant === 'hub'
              ? 'text-[18px] font-semibold tracking-[-0.02em]'
              : 'text-[13px] font-bold uppercase tracking-[0.06em]',
          ].join(' ')}
        >
          {variant === 'hub' ? 'Режимы обучения' : 'Центр активности'}
        </h2>
      )}

      {rowLayout ? (
        <div className="flex items-start gap-4 min-[480px]:gap-6 xl:gap-10">
          {STUDY_MODE_GROUPS.map((group) => {
            const modes = STUDY_MODES.filter((mode) => mode.group === group.id)
            const widthClass = group.id === 'standard' ? 'flex-[4]' : 'flex-[3]'

            return (
              <section key={group.id} className={`flex min-w-0 ${widthClass} flex-col gap-3`}>
                <SectionHeading group={group.id} label={group.label} stacked />
                <div className="flex flex-wrap gap-2 min-[480px]:gap-3">
                  {modes.map(renderModeTile)}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        STUDY_MODE_GROUPS.map((group, index) => {
          const modes = STUDY_MODES.filter((mode) => mode.group === group.id)

          return (
            <section
              key={group.id}
              className={[
                index > 0 && variant === 'sidebar' ? 'border-t border-border pt-5' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <SectionHeading group={group.id} label={group.label} />
              <div className="flex flex-wrap gap-3">{modes.map(renderModeTile)}</div>
            </section>
          )
        })
      )}
    </div>
  )
}

function SectionHeading({
  group,
  label,
  stacked = false,
}: {
  group: StudyModeGroup
  label: string
  stacked?: boolean
}) {
  return (
    <h3
      className={[
        'flex items-center gap-1.5',
        stacked ? 'min-h-[2rem] whitespace-normal leading-snug' : 'whitespace-nowrap',
        moduleLabelClass,
        stacked ? 'mb-0' : 'mb-3',
      ].join(' ')}
    >
      {label}
      {group === 'minigame' && (
        <span
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FFF6E6] text-[#C9920A]"
          title="Premium"
        >
          <Crown size={11} strokeWidth={2.5} />
        </span>
      )}
    </h3>
  )
}

interface ModeItemProps {
  mode: StudyModeOption
  sessionCardCount: number
  categoryEmpty: boolean
  isPremiumUser: boolean
  hintOpen: boolean
  onHintOpenChange: (open: boolean) => void
  onSelect: (mode: StudyModeId) => void
  onEmptyCategory: () => void
}

function ModeTile({
  mode,
  sessionCardCount,
  categoryEmpty,
  isPremiumUser,
  hintOpen,
  onHintOpenChange,
  onSelect,
  onEmptyCategory,
}: ModeItemProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const Icon = mode.icon
  const insufficientCards = sessionCardCount < mode.minCards
  const premiumLocked = Boolean(mode.premium) && !isPremiumUser
  const disabled = categoryEmpty || insufficientCards || premiumLocked
  const showCrown = Boolean(mode.premium)
  const showLock = categoryEmpty || insufficientCards
  const showHint = disabled && hintOpen

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

  const handleClick = () => {
    if (categoryEmpty) {
      onEmptyCategory()
      onHintOpenChange(true)
      return
    }
    if (disabled) {
      onHintOpenChange(!hintOpen)
      return
    }
    onSelect(mode.id)
  }

  return (
    <div ref={rootRef} className="relative">
      {showHint && (
        <ModeTileHint
          anchorRef={rootRef}
          mode={mode}
          sessionCardCount={sessionCardCount}
          categoryEmpty={categoryEmpty}
          insufficientCards={insufficientCards}
          premiumLocked={premiumLocked}
        />
      )}

      <button
        type="button"
        onClick={handleClick}
        aria-disabled={disabled}
        aria-expanded={disabled ? hintOpen : undefined}
        className={[
          'group relative flex h-[84px] w-[84px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-2 min-[480px]:h-[88px] min-[480px]:w-[88px] sm:h-[92px] sm:w-[92px]',
          moduleInteractiveClass,
          disabled
            ? 'cursor-not-allowed opacity-60 hover:scale-[1]'
            : 'transition-transform duration-150 hover:scale-[1.04] active:scale-[0.97]',
        ].join(' ')}
        style={{ backgroundColor: `${mode.accent}${disabled ? '22' : '1a'}` }}
      >
        {showCrown && <ModeTileBadge type="crown" position={showLock ? 'left' : 'right'} />}
        {showLock && <ModeTileBadge type="lock" position="right" />}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10"
          style={{
            backgroundColor: `${mode.accent}${disabled ? '32' : '28'}`,
            color: mode.accent,
          }}
        >
          <Icon size={17} strokeWidth={2} />
        </div>
        <span
          className={[
            'line-clamp-2 max-w-full px-0.5 text-center text-[10px] font-semibold leading-[1.2] sm:text-[11px]',
            disabled ? 'text-text-secondary' : 'text-text-primary',
          ].join(' ')}
        >
          {mode.shortTitle ?? mode.title}
        </span>
      </button>
    </div>
  )
}

interface ModeTileHintProps {
  anchorRef: RefObject<HTMLDivElement | null>
  mode: StudyModeOption
  sessionCardCount: number
  categoryEmpty: boolean
  insufficientCards: boolean
  premiumLocked: boolean
}

function ModeTileHint({
  anchorRef,
  mode,
  sessionCardCount,
  categoryEmpty,
  insufficientCards,
  premiumLocked,
}: ModeTileHintProps) {
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
      role="tooltip"
      style={style}
      className="pointer-events-none w-max max-w-[240px] rounded-xl bg-[#12151a] px-3 py-2.5 text-white shadow-lg"
    >
      <ul className="space-y-1.5">
        {categoryEmpty && (
          <li className="text-[12px] leading-snug">В этой категории нет карточек для запуска</li>
        )}
        {!categoryEmpty && insufficientCards && (
          <li className="flex gap-2 text-[12px] leading-snug">
            <Lock size={13} strokeWidth={2.25} className="mt-0.5 shrink-0 opacity-60" />
            <span>
              Нужно {mode.minCards} {pluralizeCards(mode.minCards)}, сейчас {sessionCardCount}
            </span>
          </li>
        )}
        {premiumLocked && (
          <li className="flex gap-2 text-[12px] leading-snug">
            <Crown size={13} strokeWidth={2.25} className="mt-0.5 shrink-0 text-[#F5C842]" />
            <span>Только с Premium</span>
          </li>
        )}
      </ul>
    </div>,
    document.body,
  )
}

function ModeTileBadge({
  type,
  position,
}: {
  type: 'lock' | 'crown'
  position: 'left' | 'right'
}) {
  return (
    <span
      className={[
        'absolute top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/90 shadow-sm',
        position === 'left' ? 'left-1.5' : 'right-1.5',
        type === 'crown' ? 'text-[#C9920A]' : 'text-text-tertiary',
      ].join(' ')}
      aria-hidden
    >
      {type === 'lock' ? (
        <Lock size={12} strokeWidth={2.25} />
      ) : (
        <Crown size={12} strokeWidth={2.25} />
      )}
    </span>
  )
}
