import { useMemo } from 'react'
import { GlobalCollectionTileGrid } from '../components/global/GlobalCollectionTile'
import { GlobalModuleSection } from '../components/global/GlobalModuleSection'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder, LoadingPlaceholder } from '../components/ui/ContentPlaceholder'
import {
  buildGlobalModuleCollections,
  splitCollectionsForHome,
} from '../lib/globalModules'
import { useGetGlobalModulesQuery } from '../store/api/modulesApi'

export function CollectionsPage() {
  const { data, isLoading } = useGetGlobalModulesQuery()
  const { modules = [], currentUserId = '' } = data ?? {}

  const collections = useMemo(
    () => buildGlobalModuleCollections(modules, currentUserId),
    [modules, currentUserId],
  )

  const { popular, tracks, curated } = useMemo(
    () => splitCollectionsForHome(collections),
    [collections],
  )

  return (
    <PageLayout>
      <header className="mb-8">
        <PageBreadcrumbs
          items={[{ label: 'Главная', to: '/' }, { label: 'Подборки' }]}
          className="mb-4"
        />
        <h1 className="mb-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary lg:text-[34px]">
          Подборки
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          Публичные наборы от сообщества — выбирайте подборку под свою цель или начните с популярного.
        </p>
      </header>

      {isLoading ? (
        <LoadingPlaceholder variant="collections-page" />
      ) : collections.length === 0 ? (
        <EmptyPlaceholder
          title="Пока нет публичных модулей"
          description="Когда авторы опубликуют наборы, они появятся здесь по подборкам."
        />
      ) : (
        <>
          {popular && (
            <GlobalModuleSection
              title={popular.title}
              subtitle={popular.subtitle}
              modules={popular.modules}
            />
          )}

          <GlobalCollectionTileGrid
            title="Выберите направление"
            subtitle="Подборки по целям: экзамен, вуз, медицина и другие"
            collections={tracks}
            size="large"
          />

          <GlobalCollectionTileGrid
            title="Ещё подборки"
            subtitle="Редакционный выбор, новинки и форматы под разное настроение"
            collections={curated}
            size="medium"
          />
        </>
      )}
    </PageLayout>
  )
}
