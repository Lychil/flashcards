import { Star } from 'lucide-react'
import { useState } from 'react'
import { ModalOverlay } from './ModalOverlay'

const STARS = [1, 2, 3, 4, 5] as const

interface StarRatingDialogProps {
  open: boolean
  title: string
  description: string
  currentRating: number
  ariaLabel: string
  onClose: () => void
  onRate: (stars: number) => void | Promise<void>
  disabled?: boolean
}

export function StarRatingDialog({
  open,
  title,
  description,
  currentRating,
  ariaLabel,
  onClose,
  onRate,
  disabled = false,
}: StarRatingDialogProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const displayRating = hoverRating || currentRating

  const handleClose = () => {
    setHoverRating(0)
    onClose()
  }

  return (
    <ModalOverlay
      open={open}
      onClose={handleClose}
      title={title}
      maxWidthClass="sm:max-w-sm"
    >
      <p className="mb-5 text-[13px] text-text-secondary">{description}</p>

      <div
        className="flex justify-center gap-1 py-2"
        onMouseLeave={() => setHoverRating(0)}
        role="group"
        aria-label={ariaLabel}
      >
        {STARS.map((star) => {
          const active = star <= displayRating

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onMouseEnter={() => setHoverRating(star)}
              onClick={() => {
                setHoverRating(0)
                void onRate(star)
              }}
              aria-label={`${star} из 5`}
              className={[
                'cursor-pointer rounded-lg p-2 transition-transform',
                'hover:scale-110 disabled:cursor-wait disabled:opacity-60',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              ].join(' ')}
            >
              <Star
                size={28}
                strokeWidth={2}
                className={active ? 'fill-[#F5B84C] text-[#F5B84C]' : 'text-text-tertiary/45'}
                aria-hidden
              />
            </button>
          )
        })}
      </div>
    </ModalOverlay>
  )
}
