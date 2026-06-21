import { Heart } from 'lucide-react'
import {
  useGetModuleFavoritesQuery,
  useToggleModuleFavoriteMutation,
} from '../../store/api/modulesApi'
import { moduleGhostButtonClass, moduleHeaderActionIconClass, MODULE_HEADER_ACTION_ICON_SIZE, MODULE_HEADER_ACTION_ICON_STROKE } from './moduleStyles'

interface ModuleFavoriteActionProps {
  moduleId: string
}

export function ModuleFavoriteAction({ moduleId }: ModuleFavoriteActionProps) {
  const { data: favoriteIds = [] } = useGetModuleFavoritesQuery()
  const [toggleFavorite] = useToggleModuleFavoriteMutation()
  const isFavorited = favoriteIds.includes(moduleId)

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(moduleId)}
      aria-label={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-pressed={isFavorited}
      title={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
      className={[
        moduleGhostButtonClass,
        'size-9 shrink-0 justify-center rounded-xl border border-border bg-white p-0',
      ].join(' ')}
    >
      <Heart
        size={MODULE_HEADER_ACTION_ICON_SIZE}
        strokeWidth={MODULE_HEADER_ACTION_ICON_STROKE}
        className={[
          moduleHeaderActionIconClass,
          isFavorited ? 'fill-red-400 text-red-400' : undefined,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      />
    </button>
  )
}
