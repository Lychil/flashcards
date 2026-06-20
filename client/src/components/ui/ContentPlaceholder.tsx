import type { CSSProperties, ReactNode } from 'react'
import { FOLDER_CARD_WIDTH } from './FolderCard'
import { MODULE_CARD_HEIGHT, MODULE_CARD_WIDTH } from './ModuleCard'

const GRID_MIN_WIDTH = Math.max(MODULE_CARD_WIDTH, FOLDER_CARD_WIDTH)

const skeletonPulseClass = 'animate-pulse bg-surface-muted'

export function SkeletonBlock({
  className = '',
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return <div className={[skeletonPulseClass, className].filter(Boolean).join(' ')} style={style} />
}

export function ModuleCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <SkeletonBlock
      className={['rounded-[22px] bg-surface-muted/80', className].filter(Boolean).join(' ')}
      style={{ width: MODULE_CARD_WIDTH, height: MODULE_CARD_HEIGHT }}
    />
  )
}

export type LoadingPlaceholderVariant =
  | 'module-grid'
  | 'search-results'
  | 'carousel'
  | 'collections-page'
  | 'collection-header'
  | 'module-page'

interface LoadingPlaceholderProps {
  variant: LoadingPlaceholderVariant
  className?: string
}

function ModuleGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_WIDTH}px, 1fr))` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-center sm:justify-start">
          <ModuleCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export function LoadingPlaceholder({ variant, className = '' }: LoadingPlaceholderProps) {
  switch (variant) {
    case 'module-grid':
      return (
        <div className={className}>
          <ModuleGridSkeleton />
        </div>
      )

    case 'search-results':
      return (
        <div className={['grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className].join(' ')}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[220px] rounded-[16px]" />
          ))}
        </div>
      )

    case 'carousel':
      return (
        <div className={['flex gap-5 overflow-hidden', className].join(' ')}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ModuleCardSkeleton key={i} className="shrink-0" />
          ))}
        </div>
      )

    case 'collections-page':
      return (
        <div className={['space-y-10', className].join(' ')}>
          <SkeletonBlock className="h-52 rounded-[22px]" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-[200px] rounded-[24px]" />
            ))}
          </div>
        </div>
      )

    case 'collection-header':
      return <SkeletonBlock className={['mb-8 h-40 rounded-[24px]', className].join(' ')} />

    case 'module-page':
      return (
        <div className={className}>
          <SkeletonBlock className="mb-8 h-36 rounded-2xl" />
          <div className="grid gap-8 xl:grid-cols-[70fr_30fr]">
            <div className="space-y-6">
              <SkeletonBlock className="h-40 rounded-2xl" />
              <SkeletonBlock className="h-96 rounded-2xl" />
            </div>
            <SkeletonBlock className="h-80 rounded-2xl" />
          </div>
        </div>
      )
  }
}

export type EmptyPlaceholderVariant = 'boxed' | 'compact' | 'inline' | 'carousel'

interface EmptyPlaceholderProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  variant?: EmptyPlaceholderVariant
  className?: string
}

const emptyShellClass: Record<EmptyPlaceholderVariant, string> = {
  boxed: 'px-6 py-10',
  compact: 'px-5 py-5',
  inline: 'py-12',
  carousel: 'flex items-center justify-center px-6',
}

export function EmptyPlaceholder({
  title,
  description,
  action,
  variant = 'boxed',
  className = '',
}: EmptyPlaceholderProps) {
  const isInline = variant === 'inline'
  const isCarousel = variant === 'carousel'

  return (
    <div
      className={[emptyShellClass[variant], 'text-center', className].filter(Boolean).join(' ')}
      style={isCarousel ? { height: MODULE_CARD_HEIGHT } : undefined}
    >
      <p
        className={
          isInline
            ? 'text-[14px] font-semibold text-text-primary'
            : isCarousel
              ? 'text-[13px] font-medium text-text-secondary'
              : 'text-[14px] font-medium text-text-primary'
        }
      >
        {title}
      </p>
      {description && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-text-secondary">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
