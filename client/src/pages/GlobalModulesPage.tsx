import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { LibraryGrid } from '../components/library/LibraryGrid'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder, LoadingPlaceholder } from '../components/ui/ContentPlaceholder'
import { statsLabelClass } from '../components/home/homeStyles'
import { normalizeGlobalSearchQuery, searchGlobalModules } from '../lib/globalModuleSearch'
import { pluralizeRu } from '../lib/pluralizeRu'
import { useGetGlobalModulesQuery } from '../store/api/modulesApi'

export function GlobalModulesPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const { data, isLoading } = useGetGlobalModulesQuery()
  const { modules = [], currentUserId = '' } = data ?? {}

  const normalizedQuery = normalizeGlobalSearchQuery(query)
  const hasQuery = normalizedQuery.length > 0

  const filteredModules = useMemo(
    () => searchGlobalModules(modules, currentUserId, query),
    [modules, currentUserId, query],
  )

  return (
    <PageLayout>
      <header className="mb-8">
        <PageBreadcrumbs
          items={[{ label: 'Главная', to: '/' }, { label: 'Глобальные модули' }]}
          className="mb-4"
        />
        <h1 className="mb-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary lg:text-[34px]">
          {hasQuery ? `Поиск: «${query.trim()}»` : 'Глобальные модули'}
        </h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-text-secondary">
          {hasQuery
            ? 'Результаты по публичным модулям сообщества.'
            : 'Введите запрос в поиск в шапке — здесь появятся подходящие модули.'}
        </p>

        {hasQuery && !isLoading && (
          <p className={`${statsLabelClass} mt-6 normal-case tracking-normal`}>
            {filteredModules.length}{' '}
            {pluralizeRu(filteredModules.length, ['результат', 'результата', 'результатов'])}
          </p>
        )}
      </header>

      {isLoading ? (
        <LoadingPlaceholder variant="search-results" />
      ) : !hasQuery ? (
        <EmptyPlaceholder
          title="Начните с поискового запроса"
          description={
            <>
              Ищите по названию, предмету или автору — или загляните в{' '}
              <Link to="/collections" className="font-medium text-accent hover:underline">
                подборки
              </Link>
              .
            </>
          }
        />
      ) : filteredModules.length === 0 ? (
        <EmptyPlaceholder
          title="Ничего не найдено"
          description={
            <>
              Попробуйте другой запрос или посмотрите готовые{' '}
              <Link to="/collections" className="font-medium text-accent hover:underline">
                подборки
              </Link>
              .
            </>
          }
        />
      ) : (
        <LibraryGrid
          folders={[]}
          modules={filteredModules}
          modulesByFolder={new Map()}
          currentUserId={currentUserId}
        />
      )}
    </PageLayout>
  )
}
