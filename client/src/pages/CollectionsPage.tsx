import { useMemo, useState } from 'react'
import { DiagramCard } from '../components/diagram/DiagramCard'
import { DiagramFavoriteAction } from '../components/diagram/DiagramFavoriteAction'
import { DiagramLibraryAction } from '../components/diagram/DiagramLibraryAction'
import { GlobalCollectionTileGrid } from '../components/global/GlobalCollectionTile'
import { GlobalModuleSection } from '../components/global/GlobalModuleSection'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder, LoadingPlaceholder } from '../components/ui/ContentPlaceholder'
import {
  buildGlobalModuleCollections,
  splitCollectionsForHome,
} from '../lib/globalModules'
import { mockDiagrams } from '../lib/mockDiagrams'
import { useGetGlobalModulesQuery } from '../store/api/modulesApi'

export function CollectionsPage() {
  const { data, isLoading } = useGetGlobalModulesQuery()
  const { modules = [], currentUserId = '' } = data ?? {}
  const [, refreshDiagramActions] = useState(0)

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

          <section className="mb-12">
            <div className="mb-5">
              <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary">
                Интерактивные диаграммы
              </h2>
              <p className="mt-1 text-[14px] text-text-secondary">
                Визуальные подборки с изображениями и разметкой для повторения.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {mockDiagrams.map((diagram) => (
                <div key={diagram.id} className="relative min-w-0">
                  <DiagramCard diagram={diagram} />
                  <div className="absolute left-5 top-5 z-20 flex gap-2">
                    <DiagramLibraryAction
                      diagramId={diagram.id}
                      display="icon"
                      onChange={() => refreshDiagramActions((version) => version + 1)}
                    />
                    <DiagramFavoriteAction
                      diagramId={diagram.id}
                      onChange={() => refreshDiagramActions((version) => version + 1)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

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
