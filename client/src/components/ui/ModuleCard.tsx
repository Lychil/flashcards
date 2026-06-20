import { Heart, Star } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { resolveModuleBaseColor } from '../../lib/cardColor'
import { formatCompactCount } from '../../lib/formatCompactCount'
import { pluralizeCards } from '../../lib/pluralizeRu'
import {
  useGetModuleFavoritesQuery,
  useToggleModuleFavoriteMutation,
} from '../../store/api/modulesApi'
import type { Module, ModuleAuthor } from '../../types/module'
import { FolderShape } from './FolderShape'

export const MODULE_CARD_WIDTH = 208
export const MODULE_PANEL_HEIGHT = 214
export const MODULE_INFO_HEIGHT = 58
export const MODULE_CARD_HEIGHT = MODULE_PANEL_HEIGHT + MODULE_INFO_HEIGHT

const HOVER_PAD_TOP = 6

const FOLDER_TOP = 14
const STACK_TOP = HOVER_PAD_TOP
const STACK_HEIGHT = MODULE_PANEL_HEIGHT - FOLDER_TOP

interface ModuleCardProps {
  module: Module
  currentUserId?: string
  onClick?: () => void
}

const LEFT_GAP = 10
const RIGHT_GAP = 6
const DECK_STEP = 12
const STACK_COUNT = 3
const STACK_CARD_WIDTH =
  MODULE_CARD_WIDTH - LEFT_GAP - RIGHT_GAP - (STACK_COUNT - 1) * DECK_STEP

const STACK_TONES = ['#ffffff', '#f4f5f7', '#e8eaee'] as const

const STACK_HOVER_CLASS = [
  'transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:-translate-y-1.5',
  'transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:-translate-y-1',
  'transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:translate-x-1 group-hover:-translate-y-0.5',
] as const

const STACK_LAYERS = Array.from({ length: STACK_COUNT }, (_, index) => ({
  left: LEFT_GAP + index * DECK_STEP,
  zIndex: STACK_COUNT - index,
  backgroundColor: STACK_TONES[index],
  hoverClass: STACK_HOVER_CLASS[index],
}))

function AuthorAvatar({ author, size = 20 }: { author: ModuleAuthor; size?: number }) {
  const initial = author.name.trim().charAt(0).toUpperCase() || '?'

  if (author.avatarUrl) {
    return (
      <img
        src={author.avatarUrl}
        alt=""
        className="shrink-0 rounded-full object-cover ring-1 ring-white/40"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-white/30 text-[9px] font-bold text-white ring-1 ring-white/40"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
    </span>
  )
}

function ModuleCardFooter({
  author,
  currentUserId,
  isFavorited,
  onToggleFavorite,
}: {
  author: ModuleAuthor
  currentUserId?: string
  isFavorited: boolean
  onToggleFavorite: () => void
}) {
  const isSelf = author.id === currentUserId
  const label = isSelf ? 'Вы' : author.name
  const showFavorite = Boolean(currentUserId && !isSelf)

  return (
    <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between gap-2">
      <div
        className={[
          'flex min-w-0 items-center gap-1.5 rounded-full bg-black/18 py-1 pl-1 pr-2.5 backdrop-blur-sm ring-1 ring-inset ring-white/20',
          showFavorite ? 'max-w-[calc(100%-36px)]' : 'max-w-full',
        ].join(' ')}
        title={isSelf ? 'Ваш модуль' : `Автор: ${author.name}`}
      >
        <AuthorAvatar author={author} size={20} />
        <span className="truncate text-[10px] font-medium leading-none text-white/90">
          {label}
        </span>
      </div>

      {showFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          aria-label={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
          aria-pressed={isFavorited}
          title={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
          className={[
            'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full',
            'bg-black/18 backdrop-blur-sm ring-1 ring-inset ring-white/20',
            'transition-colors hover:bg-black/28',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80',
          ].join(' ')}
        >
          <Heart
            size={14}
            strokeWidth={2}
            className={isFavorited ? 'fill-red-400 text-red-400' : 'text-white/90'}
            aria-hidden
          />
        </button>
      )}
    </div>
  )
}

function ModuleSocialMetrics({
  rating,
  favoriteCount,
}: {
  rating: number
  favoriteCount: number
}) {
  if (rating <= 0 && favoriteCount <= 0) return null

  return (
    <div className="absolute left-3 top-[20px] z-30 flex items-center gap-1.5">
      {rating > 0 && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-black/18 py-1.5 pl-2 pr-2.5 backdrop-blur-sm ring-1 ring-inset ring-white/20"
          title={`Оценка ${rating.toFixed(1)} из 5`}
        >
          <Star size={12} strokeWidth={2} className="fill-[#F5B84C] text-[#F5B84C]" aria-hidden />
          <span className="text-[11px] font-semibold leading-none tabular-nums text-white/95">
            {rating.toFixed(1)}
          </span>
        </span>
      )}
      {favoriteCount > 0 && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-black/18 py-1.5 pl-2 pr-2.5 backdrop-blur-sm ring-1 ring-inset ring-white/20"
          title={`${favoriteCount.toLocaleString('ru-RU')} в избранном`}
        >
          <Heart size={12} strokeWidth={2} className="fill-red-400 text-red-400" aria-hidden />
          <span className="text-[11px] font-semibold leading-none tabular-nums text-white/95">
            {formatCompactCount(favoriteCount)}
          </span>
        </span>
      )}
    </div>
  )
}

export function ModuleCard({ module, currentUserId, onClick }: ModuleCardProps) {
  const { data: favoriteIds = [] } = useGetModuleFavoritesQuery()
  const [toggleFavorite] = useToggleModuleFavoriteMutation()
  const isFavorited = favoriteIds.includes(module.id)

  const baseColor = resolveModuleBaseColor(module.id, module.color)
  const learnedCount = Math.round((module.wordCount * module.progress) / 100)
  const showStack = module.wordCount > 0

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={[
        'group relative flex cursor-pointer flex-col overflow-visible text-left',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
      ].join(' ')}
      style={{
        width: MODULE_CARD_WIDTH,
        height: MODULE_CARD_HEIGHT,
      }}
    >
      <div
        className="relative shrink-0 overflow-visible"
        style={{ height: MODULE_PANEL_HEIGHT }}
      >
        {showStack &&
          STACK_LAYERS.map((layer, index) => (
            <div
              key={index}
              aria-hidden
              className={[
                'absolute rounded-[16px] border-[1.5px] border-[#d4d9e0]',
                layer.hoverClass,
              ].join(' ')}
              style={{
                top: STACK_TOP,
                left: layer.left,
                width: STACK_CARD_WIDTH,
                height: STACK_HEIGHT,
                zIndex: layer.zIndex,
                backgroundColor: layer.backgroundColor,
              }}
            />
          ))}

        <div
          className="absolute inset-x-0 bottom-0 z-10"
          style={{ top: FOLDER_TOP, height: STACK_HEIGHT }}
        >
          <FolderShape color={baseColor} />

          <ModuleSocialMetrics rating={module.rating} favoriteCount={module.favoriteCount} />
          <ModuleCardFooter
            author={module.author}
            currentUserId={currentUserId}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavorite(module.id)}
          />
        </div>
      </div>

      <div
        className="flex shrink-0 flex-col justify-center pt-2.5"
        style={{ height: MODULE_INFO_HEIGHT }}
      >
        <h3 className="mb-1 line-clamp-1 text-[14px] font-semibold leading-tight tracking-[-0.02em] text-text-primary">
          {module.title}
        </h3>

        <p className="mb-1.5 text-[11px] text-text-tertiary tabular-nums">
          {module.wordCount > 0
            ? `${learnedCount}/${module.wordCount} ${pluralizeCards(module.wordCount)} · ${module.progress}%`
            : 'Карточек пока нет'}
        </p>

        <div
          className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-valuenow={module.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            module.wordCount > 0
              ? `Изучено ${module.progress}%`
              : 'Модуль без карточек'
          }
        >
          <div
            className="h-full rounded-full bg-text-tertiary/40"
            style={{ width: `${module.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
