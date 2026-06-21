import {
  useGetModuleFavoritesQuery,
  useToggleModuleFavoriteMutation,
} from '../../store/api/modulesApi'
import { FavoriteToggleButton } from '../ui/FavoriteToggleButton'
import { moduleGhostButtonClass, moduleHeaderActionIconClass, MODULE_HEADER_ACTION_ICON_SIZE, MODULE_HEADER_ACTION_ICON_STROKE } from './moduleStyles'

interface ModuleFavoriteActionProps {
  moduleId: string
}

export function ModuleFavoriteAction({ moduleId }: ModuleFavoriteActionProps) {
  const { data: favoriteIds = [] } = useGetModuleFavoritesQuery()
  const [toggleFavorite] = useToggleModuleFavoriteMutation()
  const isFavorited = favoriteIds.includes(moduleId)

  return (
    <FavoriteToggleButton
      isFavorited={isFavorited}
      onToggle={() => toggleFavorite(moduleId)}
      className={[
        moduleGhostButtonClass,
        'size-9 shrink-0 justify-center rounded-xl border border-border bg-white p-0',
      ].join(' ')}
      iconClassName={[
          moduleHeaderActionIconClass,
          isFavorited ? 'fill-red-400 text-red-400' : undefined,
        ]
          .filter(Boolean)
          .join(' ')}
      iconSize={MODULE_HEADER_ACTION_ICON_SIZE}
      iconStrokeWidth={MODULE_HEADER_ACTION_ICON_STROKE}
    />
  )
}
