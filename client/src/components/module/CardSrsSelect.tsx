import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import {
  CARD_SRS_CHOICE_META,
  CARD_SRS_CHOICES,
  cardSrsChoiceToRating,
  getCardSrsChoice,
} from '../../lib/cardSrsChoice'
import type { Flashcard } from '../../types/flashcard'
import type { CardSrsChoice, SrsRating } from '../../types/srs'
import { moduleInteractiveClass } from './moduleStyles'

interface CardSrsSelectProps {
  card: Flashcard
  onRate: (cardId: string, rating: SrsRating) => void
  className?: string
}

export function CardSrsSelect({ card, onRate, className = '' }: CardSrsSelectProps) {
  const value = getCardSrsChoice(card)
  const meta = CARD_SRS_CHOICE_META[value]
  const menuId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectChoice = (next: CardSrsChoice) => {
    setOpen(false)
    if (next === value) return
    onRate(card.id, cardSrsChoiceToRating(next))
  }

  return (
    <div ref={containerRef} className={['relative', open ? 'z-30' : '', className].join(' ')}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={menuId}
        aria-label={`Статус карточки «${card.term}»: ${meta.label}`}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'inline-flex w-full min-w-[7.25rem] cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5',
          'text-[13px] font-semibold transition-colors hover:opacity-90',
          moduleInteractiveClass,
          meta.pillClass,
          open ? 'opacity-100' : '',
        ].join(' ')}
      >
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color }}
          aria-hidden
        />
        <span className="min-w-0 flex-1 truncate text-left">{meta.label}</span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={[
            'shrink-0 opacity-70 transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={menuId}
          role="listbox"
          aria-label="Статус карточки"
          className={[
            'absolute left-0 top-full z-30 mt-1.5 min-w-full overflow-hidden',
            'rounded-xl border border-border bg-white py-1',
            'border border-border',
          ].join(' ')}
        >
          {CARD_SRS_CHOICES.map((option) => {
            const optionMeta = CARD_SRS_CHOICE_META[option.value]
            const selected = option.value === value

            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectChoice(option.value)}
                  className={[
                    'flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left',
                    'text-[13px] font-medium text-text-primary transition-colors',
                    'hover:bg-surface-muted focus-visible:outline-none focus-visible:bg-surface-muted',
                    selected ? 'bg-surface-subtle' : '',
                  ].join(' ')}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: optionMeta.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{optionMeta.label}</span>
                  {selected && (
                    <Check size={14} strokeWidth={2.5} className="shrink-0 opacity-80" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
