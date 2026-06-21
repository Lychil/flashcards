import { Heart } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'

interface FavoriteToggleButtonProps {
  isFavorited: boolean
  onToggle: () => void
  className: string
  children?: ReactNode
  iconClassName?: string
  iconSize?: number
  iconStrokeWidth?: number
  favoritedLabel?: string
  unfavoritedLabel?: string
  stopPropagation?: boolean
}

export function FavoriteToggleButton({
  isFavorited,
  onToggle,
  className,
  children,
  iconClassName,
  iconSize = 15,
  iconStrokeWidth = 2,
  favoritedLabel = 'Убрать из избранного',
  unfavoritedLabel = 'Добавить в избранное',
  stopPropagation = false,
}: FavoriteToggleButtonProps) {
  const label = isFavorited ? favoritedLabel : unfavoritedLabel

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) event.stopPropagation()
    onToggle()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isFavorited}
      title={label}
      className={className}
    >
      <Heart
        size={iconSize}
        strokeWidth={iconStrokeWidth}
        className={iconClassName ?? (isFavorited ? 'fill-red-400 text-red-400' : undefined)}
        aria-hidden
      />
      {children}
    </button>
  )
}
