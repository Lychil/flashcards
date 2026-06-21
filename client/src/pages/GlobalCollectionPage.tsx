import { ChevronLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatCollectionCardCount } from '../components/global/GlobalCollectionTile'
import { LibraryGrid } from '../components/library/LibraryGrid'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder, LoadingPlaceholder } from '../components/ui/ContentPlaceholder'
import {
  collectionStats,
  findGlobalCollection,
} from '../lib/globalModules'
import { pluralizeRu } from '../lib/pluralizeRu'
import { useGetGlobalModulesQuery } from '../store/api/modulesApi'

const backLinkClass =
  'mb-5 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary'

export function GlobalCollectionPage() {
  const { collectionId = '' } = useParams()
  const { data, isLoading } = useGetGlobalModulesQuery()
  const { modules = [], currentUserId = '' } = data ?? {}

  const collection = useMemo(
    () => (collectionId ? findGlobalCollection(collectionId, modules, currentUserId) : null),
    [collectionId, modules, currentUserId],
  )

  if (isLoading) {
    return (
      <PageLayout>
        <PageBreadcrumbs
          items={[
            { label: 'Главная', to: '/' },
            { label: 'Подборки', to: '/collections' },
            { label: '…' },
          ]}
          className="mb-5"
        />
        <Link to="/collections" className={backLinkClass}>
          <ChevronLeft size={16} strokeWidth={2} />
          Все подборки
        </Link>
        <LoadingPlaceholder variant="collection-header" />
        <LibraryGrid
          folders={[]}
          modules={[]}
          modulesByFolder={new Map()}
          isLoading
        />
      </PageLayout>
    )
  }

  if (!collection) {
    return (
      <PageLayout>
        <PageBreadcrumbs
          items={[
            { label: 'Главная', to: '/' },
            { label: 'Подборки', to: '/collections' },
            { label: 'Подборка' },
          ]}
          className="mb-5"
        />
        <Link to="/collections" className={backLinkClass}>
          <ChevronLeft size={16} strokeWidth={2} />
          Все подборки
        </Link>
        <EmptyPlaceholder
          title="Подборка не найдена"
          description="Возможно, она была удалена или ссылка устарела."
        />
      </PageLayout>
    )
  }

  const Icon = collection.icon
  const stats = collectionStats(collection.modules)

  return (
    <PageLayout>
      <PageBreadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Подборки', to: '/collections' },
          { label: collection.title },
        ]}
        className="mb-5"
      />

      <Link to="/collections" className={backLinkClass}>
        <ChevronLeft size={16} strokeWidth={2} />
        Все подборки
      </Link>

      <header
        className="relative mb-8 overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10"
        style={{ backgroundColor: collection.accentLight }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: collection.accent }}
        />
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: collection.accent }}
            >
              <Icon size={28} strokeWidth={2} />
            </span>
            {collection.badge && (
              <span
                className="rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: collection.accent }}
              >
                {collection.badge}
              </span>
            )}
          </div>
          <h1 className="mb-2 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-text-primary sm:text-[34px]">
            {collection.title}
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary">{collection.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-[13px] text-text-secondary">
            <span>
              <strong className="font-semibold text-text-primary">{collection.modules.length}</strong>{' '}
              {pluralizeRu(collection.modules.length, ['модуль', 'модуля', 'модулей'])}
            </span>
            {stats.avgRating > 0 && (
              <span>
                рейтинг{' '}
                <strong className="font-semibold text-text-primary">{stats.avgRating}</strong>
              </span>
            )}
            <span>{formatCollectionCardCount(stats.totalCards)} всего</span>
          </div>
        </div>
      </header>

      <LibraryGrid
        folders={[]}
        modules={collection.modules}
        modulesByFolder={new Map()}
        currentUserId={currentUserId}
      />
    </PageLayout>
  )
}
