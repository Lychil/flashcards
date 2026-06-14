import {
  CARD_SRS_CHOICE_META,
  CARD_SRS_CHOICES,
  cardSrsChoiceToRating,
} from '../../lib/cardSrsChoice'
import type { CardSrsChoice, SrsRating } from '../../types/srs'
import { moduleInteractiveClass } from './moduleStyles'

interface CardSrsChoiceButtonsProps {
  onRate: (rating: SrsRating) => void
  disabled?: boolean
  className?: string
}

export function CardSrsChoiceButtons({ onRate, disabled, className = '' }: CardSrsChoiceButtonsProps) {
  const choose = (choice: CardSrsChoice) => {
    onRate(cardSrsChoiceToRating(choice))
  }

  return (
    <div
      className={[
        'grid w-full grid-cols-3 gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {CARD_SRS_CHOICES.map(({ value, label }) => {
        const meta = CARD_SRS_CHOICE_META[value]

        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => choose(value)}
            className={[
              'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2.5',
              'text-[13px] font-semibold transition-opacity hover:opacity-90',
              moduleInteractiveClass,
              meta.pillClass,
              'disabled:cursor-not-allowed disabled:opacity-40',
            ].join(' ')}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: meta.color }}
              aria-hidden
            />
            {label}
          </button>
        )
      })}
    </div>
  )
}
