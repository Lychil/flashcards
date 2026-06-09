import { resolveModuleBaseColor } from '../../lib/cardColor'
import { pluralizeCards } from '../../lib/pluralizeRu'
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

function ModuleAuthorBadge({
  author,
  currentUserId,
}: {
  author: ModuleAuthor
  currentUserId?: string
}) {
  const isSelf = author.id === currentUserId
  const label = isSelf ? 'Вы' : author.name

  return (
    <div
      className="absolute bottom-3 left-3 z-30 flex max-w-[calc(100%-24px)] items-center gap-1.5 rounded-full bg-black/18 py-1 pl-1 pr-2.5 backdrop-blur-sm ring-1 ring-inset ring-white/20"
      title={isSelf ? 'Ваш модуль' : `Автор: ${author.name}`}
    >
      <AuthorAvatar author={author} size={20} />
      <span className="truncate text-[10px] font-medium leading-none text-white/90">
        {label}
      </span>
    </div>
  )
}

export function ModuleCard({ module, currentUserId, onClick }: ModuleCardProps) {
  const baseColor = resolveModuleBaseColor(module.id, module.color)
  const learnedCount = Math.round((module.wordCount * module.progress) / 100)
  const showStack = module.wordCount > 0

  return (
    <button
      type="button"
      onClick={onClick}
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

          <ModuleAuthorBadge author={module.author} currentUserId={currentUserId} />
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
    </button>
  )
}
