import { useState } from 'react'
import { diagramFavoritesRepository } from '../../services/diagramFavoritesRepository'
import { FavoriteToggleButton } from '../ui/FavoriteToggleButton'
import { Tooltip } from '../ui/Tooltip'

interface DiagramFavoriteActionProps {
  diagramId: string
  display?: 'icon' | 'button'
  className?: string
  onChange?: () => void
}

export function DiagramFavoriteAction({
  diagramId,
  display = 'icon',
  className = '',
  onChange,
}: DiagramFavoriteActionProps) {
  const [isFavorited, setIsFavorited] = useState(() =>
    diagramFavoritesRepository.isFavorited(diagramId),
  )
  const label = isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'
  const isIcon = display === 'icon'
  const actionClass = isIcon
    ? [
        'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/95 text-text-secondary',
        'transition-colors hover:bg-surface-subtle hover:text-text-primary',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className,
      ].filter(Boolean).join(' ')
    : [
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-subtle px-4 py-2.5',
        'text-[13px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary',
        className,
      ].filter(Boolean).join(' ')

  const button = (
    <FavoriteToggleButton
      isFavorited={isFavorited}
      onToggle={() => {
        const next = diagramFavoritesRepository.toggle(diagramId)
        setIsFavorited(next)
        onChange?.()
      }}
      className={actionClass}
      iconClassName={isFavorited ? 'fill-red-400 text-red-400' : undefined}
    >
      {!isIcon && (isFavorited ? 'В избранном' : 'В избранное')}
    </FavoriteToggleButton>
  )

  return isIcon ? (
    <Tooltip label={label} side="top">
      {button}
    </Tooltip>
  ) : (
    button
  )
}
