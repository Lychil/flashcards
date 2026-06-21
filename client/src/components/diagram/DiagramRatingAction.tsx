import { Star, X } from 'lucide-react'
import { useId, useState } from 'react'
import { diagramRatingsRepository } from '../../services/diagramRatingsRepository'

interface DiagramRatingActionProps {
  diagramId: string
}

export function DiagramRatingAction({ diagramId }: DiagramRatingActionProps) {
  const dialogId = useId()
  const [open, setOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const [userRating, setUserRating] = useState(() =>
    diagramRatingsRepository.getUserRating(diagramId),
  )
  const displayRating = hoverRating || userRating

  const handleRate = (stars: number) => {
    const result = diagramRatingsRepository.rate(diagramId, stars)
    setUserRating(result.userRating)
    setHoverRating(0)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-subtle px-4 py-2.5 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
      >
        <Star
          size={15}
          strokeWidth={2}
          className={userRating > 0 ? 'fill-[#F5B84C] text-[#F5B84C]' : undefined}
          aria-hidden
        />
        {userRating > 0 ? `Оценка: ${userRating}` : 'Оценить'}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151a]/40 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogId}
            className="w-full max-w-sm rounded-2xl bg-white p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id={dialogId} className="text-[18px] font-semibold text-text-primary">
                  {userRating > 0 ? 'Изменить оценку' : 'Оцените диаграмму'}
                </h2>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Выберите оценку от 1 до 5 звёзд
                </p>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text-tertiary hover:bg-surface-subtle hover:text-text-primary"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div
              className="flex justify-center gap-1 py-2"
              onMouseLeave={() => setHoverRating(0)}
              role="group"
              aria-label="Оценка диаграммы от 1 до 5"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= displayRating

                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => handleRate(star)}
                    aria-label={`${star} из 5`}
                    className="cursor-pointer rounded-lg p-2 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
          </div>
        </div>
      )}
    </>
  )
}
