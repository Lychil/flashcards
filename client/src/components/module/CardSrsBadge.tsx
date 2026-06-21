import { CARD_SRS_CHOICE_META, getCardSrsChoice } from '../../lib/cardSrsChoice'
import type { Flashcard } from '../../types/flashcard'

interface CardSrsBadgeProps {
  card: Flashcard
  className?: string
}

export function CardSrsBadge({ card, className = '' }: CardSrsBadgeProps) {
  const value = getCardSrsChoice(card)
  const meta = CARD_SRS_CHOICE_META[value]

  return (
    <span
      className={[
        'inline-flex w-full min-w-[7.25rem] items-center gap-1.5 rounded-full px-3 py-1.5',
        'text-[13px] font-semibold',
        meta.pillClass,
        className,
      ].join(' ')}
      aria-label={`Статус: ${meta.label}`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-left">{meta.label}</span>
    </span>
  )
}
