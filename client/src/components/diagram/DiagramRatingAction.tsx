import { Star } from 'lucide-react'
import { useState } from 'react'
import { diagramRatingsRepository } from '../../services/diagramRatingsRepository'
import { StarRatingDialog } from '../ui/StarRatingDialog'

interface DiagramRatingActionProps {
  diagramId: string
}

export function DiagramRatingAction({ diagramId }: DiagramRatingActionProps) {
  const [open, setOpen] = useState(false)
  const [userRating, setUserRating] = useState(() =>
    diagramRatingsRepository.getUserRating(diagramId) ?? 0,
  )

  const handleRate = (stars: number) => {
    const result = diagramRatingsRepository.rate(diagramId, stars)
    setUserRating(result.userRating)
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

      <StarRatingDialog
        open={open}
        title={userRating > 0 ? 'Изменить оценку' : 'Оцените диаграмму'}
        description="Выберите оценку от 1 до 5 звёзд"
        currentRating={userRating}
        ariaLabel="Оценка диаграммы от 1 до 5"
        onClose={() => setOpen(false)}
        onRate={handleRate}
      />
    </>
  )
}
