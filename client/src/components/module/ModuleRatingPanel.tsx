import { Star } from 'lucide-react'
import { useState } from 'react'
import {
  useGetModuleRatingsQuery,
  useRateModuleMutation,
} from '../../store/api/modulesApi'
import { StarRatingDialog } from '../ui/StarRatingDialog'
import { moduleGhostButtonClass, moduleHeaderActionIconClass, MODULE_HEADER_ACTION_ICON_SIZE, MODULE_HEADER_ACTION_ICON_STROKE } from './moduleStyles'

interface ModuleRatingActionProps {
  moduleId: string
}

export function ModuleRatingAction({ moduleId }: ModuleRatingActionProps) {
  const { data: userRatings = {} } = useGetModuleRatingsQuery()
  const [rateModule, { isLoading }] = useRateModuleMutation()
  const [open, setOpen] = useState(false)

  const userRating = userRatings[moduleId] ?? 0

  const handleRate = async (stars: number) => {
    await rateModule({ moduleId, rating: stars })
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          moduleGhostButtonClass,
          'h-9 rounded-xl border border-border bg-white px-3 py-2',
        ].join(' ')}
      >
        <Star
          size={MODULE_HEADER_ACTION_ICON_SIZE}
          strokeWidth={MODULE_HEADER_ACTION_ICON_STROKE}
          className={[
            moduleHeaderActionIconClass,
            userRating > 0 ? 'fill-[#F5B84C] text-[#F5B84C]' : undefined,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        />
        {userRating > 0 ? `Оценка: ${userRating}` : 'Оценить'}
      </button>

      <StarRatingDialog
        open={open}
        title={userRating > 0 ? 'Изменить оценку' : 'Оцените модуль'}
        description={
          userRating > 0
            ? 'Выберите новую оценку от 1 до 5 звёзд'
            : 'Как вам этот набор карточек?'
        }
        currentRating={userRating}
        ariaLabel="Оценка модуля от 1 до 5"
        disabled={isLoading}
        onClose={() => setOpen(false)}
        onRate={handleRate}
      />
    </>
  )
}
