import { Star, X } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import {
  useGetModuleRatingsQuery,
  useRateModuleMutation,
} from '../../store/api/modulesApi'
import { moduleGhostButtonClass, moduleInteractiveClass } from './moduleStyles'

interface ModuleRatingActionProps {
  moduleId: string
}

export function ModuleRatingAction({ moduleId }: ModuleRatingActionProps) {
  const dialogId = useId()
  const { data: userRatings = {} } = useGetModuleRatingsQuery()
  const [rateModule, { isLoading }] = useRateModuleMutation()
  const [open, setOpen] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)

  const userRating = userRatings[moduleId] ?? 0
  const displayRating = hoverRating || userRating

  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const handleRate = async (stars: number) => {
    await rateModule({ moduleId, rating: stars })
    setOpen(false)
    setHoverRating(0)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          moduleGhostButtonClass,
          'rounded-xl border border-border bg-white px-3 py-2',
        ].join(' ')}
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
            className="w-full max-w-sm rounded-2xl border border-border bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id={dialogId} className="text-[18px] font-semibold text-text-primary">
                  {userRating > 0 ? 'Изменить оценку' : 'Оцените модуль'}
                </h2>
                <p className="mt-1 text-[13px] text-text-secondary">
                  {userRating > 0
                    ? 'Выберите новую оценку от 1 до 5 звёзд'
                    : 'Как вам этот набор карточек?'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
                className={[
                  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text-tertiary hover:bg-surface-subtle hover:text-text-primary',
                  moduleInteractiveClass,
                ].join(' ')}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div
              className="flex justify-center gap-1 py-2"
              onMouseLeave={() => setHoverRating(0)}
              role="group"
              aria-label="Оценка модуля от 1 до 5"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= displayRating

                return (
                  <button
                    key={star}
                    type="button"
                    disabled={isLoading}
                    onMouseEnter={() => setHoverRating(star)}
                    onClick={() => handleRate(star)}
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
                      className={
                        active
                          ? 'fill-[#F5B84C] text-[#F5B84C]'
                          : 'text-text-tertiary/45'
                      }
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
