import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { GlobalModuleCollection } from '../../lib/globalModules'
import { pluralizeCards, pluralizeRu } from '../../lib/pluralizeRu'

interface GlobalCollectionTileProps {
  collection: GlobalModuleCollection
  size?: 'large' | 'medium'
}

export function GlobalCollectionTile({ collection, size = 'medium' }: GlobalCollectionTileProps) {
  const Icon = collection.icon
  const isLarge = size === 'large'
  const preview = collection.modules.slice(0, 3)

  return (
    <Link
      to={`/collections/${collection.id}`}
      className={[
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] border border-border/60',
        'transition-all duration-300 hover:-translate-y-1 hover:border-border',
        isLarge ? 'min-h-[200px] p-6 sm:min-h-[220px]' : 'min-h-[168px] p-5',
      ].join(' ')}
      style={{ backgroundColor: collection.accentLight }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ backgroundColor: collection.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full opacity-25 blur-xl"
        style={{ backgroundColor: collection.accent }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
            style={{ backgroundColor: collection.accent }}
          >
            <Icon size={22} strokeWidth={2} />
          </span>
          {collection.badge && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: collection.accent }}
            >
              {collection.badge}
            </span>
          )}
        </div>

        <h3
          className={[
            'font-semibold leading-snug tracking-[-0.02em] text-text-primary',
            isLarge ? 'text-[20px] sm:text-[22px]' : 'text-[17px]',
          ].join(' ')}
        >
          {collection.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-text-secondary">
          {collection.subtitle}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-text-tertiary">
              {collection.modules.length}{' '}
              {pluralizeRu(collection.modules.length, ['модуль', 'модуля', 'модулей'])}
            </p>
            {preview.length > 0 && (
              <p className="mt-1 line-clamp-1 text-[12px] text-text-secondary">
                {preview.map((m) => m.title).join(' · ')}
              </p>
            )}
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-white transition-opacity group-hover:opacity-90"
            style={{ backgroundColor: collection.accent }}
          >
            Смотреть
            <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

interface GlobalCollectionTileGridProps {
  collections: GlobalModuleCollection[]
  size?: 'large' | 'medium'
  title?: string
  subtitle?: string
}

export function GlobalCollectionTileGrid({
  collections,
  size = 'medium',
  title,
  subtitle,
}: GlobalCollectionTileGridProps) {
  if (collections.length === 0) return null

  const gridClass =
    size === 'large'
      ? 'grid grid-cols-1 gap-4 sm:grid-cols-2'
      : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="mb-12">
      {title && (
        <div className="mb-5">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[14px] text-text-secondary">{subtitle}</p>
          )}
        </div>
      )}
      <div className={gridClass}>
        {collections.map((c) => (
          <GlobalCollectionTile key={c.id} collection={c} size={size} />
        ))}
      </div>
    </section>
  )
}

export function formatCollectionCardCount(count: number): string {
  return `${count} ${pluralizeCards(count)}`
}
