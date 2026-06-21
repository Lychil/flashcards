import { useMemo, useState, type ReactNode } from 'react'
import { DiagramCard } from '../components/diagram/DiagramCard'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder, LoadingPlaceholder } from '../components/ui/ContentPlaceholder'
import { FolderCard, FOLDER_CARD_WIDTH } from '../components/ui/FolderCard'
import { MODULE_CARD_WIDTH, ModuleCard } from '../components/ui/ModuleCard'
import { SearchBar } from '../components/ui/SearchBar'
import { resolveModuleBaseColor } from '../lib/cardColor'
import { mockDiagrams } from '../lib/mockDiagrams'
import { diagramFavoritesRepository } from '../services/diagramFavoritesRepository'
import {
  useGetCurrentUserQuery,
  useGetModuleFavoritesQuery,
  useGetLibraryFoldersQuery,
  useGetLibraryModulesQuery,
} from '../store/api/modulesApi'
import { diagramRepository } from '../services/diagramRepository'
import type { Diagram } from '../types/diagram'
import type { LibraryFolder } from '../types/library'
import type { Module } from '../types/module'
import { useNavigate } from 'react-router-dom'

const GRID_MIN_WIDTH = Math.max(MODULE_CARD_WIDTH, FOLDER_CARD_WIDTH)

type LibraryTab = 'favorites' | 'folders' | 'modules' | 'diagrams' | 'linked'
type LibraryResourceFilter = 'modules' | 'folders' | 'diagrams'

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query)
}

function moduleMatchesQuery(module: Module, query: string): boolean {
  if (!query) return true
  return [
    module.title,
    module.description,
    module.category,
    module.author.name,
    module.previewWords.join(' '),
  ].some((value) => matchesQuery(value, query))
}

function folderMatchesQuery(folder: LibraryFolder, query: string): boolean {
  if (!query) return true
  return [folder.name, folder.description].some((value) => matchesQuery(value, query))
}

function diagramMatchesQuery(diagram: Diagram, query: string): boolean {
  if (!query) return true
  return [
    diagram.title,
    diagram.description,
    diagram.subject,
    diagram.markers.map((marker) => marker.label).join(' '),
  ].some((value) => matchesQuery(value, query))
}

function Section({ children }: { children: ReactNode }) {
  return <section className="mb-10">{children}</section>
}

function CardGrid({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_WIDTH}px, 1fr))` }}
    >
      {children}
    </div>
  )
}

function ModuleGrid({
  modules,
  currentUserId,
}: {
  modules: Module[]
  currentUserId?: string
}) {
  const navigate = useNavigate()

  return (
    <CardGrid>
      {modules.map((module) => (
        <div key={module.id} className="flex justify-center sm:justify-start">
          <ModuleCard
            module={module}
            currentUserId={currentUserId}
            onClick={() => navigate(`/module/${module.id}`)}
          />
        </div>
      ))}
    </CardGrid>
  )
}

function DiagramGrid({ diagrams }: { diagrams: Diagram[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {diagrams.map((diagram) => (
        <DiagramCard key={diagram.id} diagram={diagram} />
      ))}
    </div>
  )
}

export function LibraryPage() {
  const { data: user } = useGetCurrentUserQuery()
  const { data: modules, isLoading: modulesLoading } = useGetLibraryModulesQuery()
  const { data: folders, isLoading: foldersLoading } = useGetLibraryFoldersQuery()
  const { data: favoriteModuleIds = [] } = useGetModuleFavoritesQuery()
  const [libraryDiagrams] = useState(() => diagramRepository.loadLibrary())
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<LibraryTab>('favorites')
  const [resourceFilter, setResourceFilter] = useState<LibraryResourceFilter>('modules')

  const isLoading = modulesLoading || foldersLoading
  const normalizedQuery = query.toLowerCase().trim()

  const modulesByFolder = useMemo(() => {
    const map = new Map<string, Module[]>()
    for (const module of modules ?? []) {
      if (!module.folderId) continue
      const list = map.get(module.folderId) ?? []
      list.push(module)
      map.set(module.folderId, list)
    }
    return map
  }, [modules])

  const rootModules = useMemo(
    () => (modules ?? []).filter((m) => !m.folderId),
    [modules],
  )

  const filteredFolders = useMemo(
    () => (folders ?? []).filter((folder) => folderMatchesQuery(folder, normalizedQuery)),
    [folders, normalizedQuery],
  )

  const ownModules = useMemo(
    () => rootModules.filter((module) => !module.sourceModuleId && moduleMatchesQuery(module, normalizedQuery)),
    [rootModules, normalizedQuery],
  )

  const linkedModules = useMemo(
    () => (modules ?? []).filter((module) => module.sourceModuleId && moduleMatchesQuery(module, normalizedQuery)),
    [modules, normalizedQuery],
  )

  const filteredDiagrams = useMemo(
    () => libraryDiagrams.filter((diagram) => diagramMatchesQuery(diagram, normalizedQuery)),
    [libraryDiagrams, normalizedQuery],
  )

  const favoriteDiagramIds = diagramFavoritesRepository.loadAll()
  const allKnownDiagrams = [...libraryDiagrams, ...mockDiagrams].filter((diagram, index, list) => {
    const key = diagram.sourceDiagramId ?? diagram.id
    return list.findIndex((item) => (item.sourceDiagramId ?? item.id) === key) === index
  })
  const favoriteModules = useMemo(
    () =>
      (modules ?? []).filter(
        (module) => favoriteModuleIds.includes(module.sourceModuleId ?? module.id) && moduleMatchesQuery(module, normalizedQuery),
      ),
    [modules, favoriteModuleIds, normalizedQuery],
  )
  const favoriteDiagrams = useMemo(
    () =>
      allKnownDiagrams.filter(
        (diagram) =>
          (favoriteDiagramIds.includes(diagram.id) ||
            Boolean(diagram.sourceDiagramId && favoriteDiagramIds.includes(diagram.sourceDiagramId))) &&
          diagramMatchesQuery(diagram, normalizedQuery),
      ),
    [allKnownDiagrams, favoriteDiagramIds, normalizedQuery],
  )
  const linkedDiagrams = useMemo(
    () => filteredDiagrams.filter((diagram) => diagram.sourceDiagramId),
    [filteredDiagrams],
  )

  const hasAnyResults =
    filteredFolders.length > 0 ||
    ownModules.length > 0 ||
    filteredDiagrams.length > 0 ||
    favoriteModules.length > 0 ||
    favoriteDiagrams.length > 0 ||
    linkedModules.length > 0 ||
    linkedDiagrams.length > 0

  const favoriteCount = favoriteModules.length + favoriteDiagrams.length
  const linkedCount = linkedModules.length + linkedDiagrams.length
  const tabs: Array<{ id: LibraryTab; label: string; count: number }> = [
    { id: 'favorites', label: 'Избранное', count: favoriteCount },
    { id: 'folders', label: 'Папки', count: filteredFolders.length },
    { id: 'modules', label: 'Модули', count: ownModules.length },
    { id: 'diagrams', label: 'Диаграммы', count: filteredDiagrams.length },
    { id: 'linked', label: 'Ссылки на чужие ресурсы', count: linkedCount },
  ]
  const filterOptions: Array<{ id: LibraryResourceFilter; label: string; count: number }> = [
    {
      id: 'modules',
      label: 'Модули',
      count: activeTab === 'favorites' ? favoriteModules.length : linkedModules.length,
    },
    {
      id: 'folders',
      label: 'Папки',
      count: 0,
    },
    {
      id: 'diagrams',
      label: 'Диаграммы',
      count: activeTab === 'favorites' ? favoriteDiagrams.length : linkedDiagrams.length,
    },
  ]
  const showResourceFilter = activeTab === 'favorites' || activeTab === 'linked'

  return (
    <PageLayout>
      <header className="mb-8">
        <PageBreadcrumbs
          items={[{ label: 'Главная', to: '/' }, { label: 'Библиотека' }]}
          className="mb-4"
        />
        <div className="min-w-0">
          <h1 className="mb-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary lg:text-[34px]">
            Моя библиотека
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary">
            Папки, модули, диаграммы и сохранённые материалы в одном месте
          </p>
        </div>
        <SearchBar
          value={query}
          onValueChange={setQuery}
          placeholder="Поиск по библиотеке..."
          wrapperClassName="mt-6 max-w-[560px]"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id !== 'favorites' && tab.id !== 'linked') {
                    setResourceFilter('modules')
                  }
                }}
                className={[
                  'inline-flex cursor-pointer items-center rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  active
                    ? 'bg-accent text-white'
                    : 'bg-surface-subtle text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                ].join(' ')}
              >
                {tab.label} ({tab.count})
              </button>
            )
          })}
        </div>
        {showResourceFilter && (
          <details className="relative mt-3 inline-block">
            <summary className="inline-flex cursor-pointer list-none items-center rounded-full bg-surface-subtle px-3 py-1.5 text-[12px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary">
              Фильтр: {filterOptions.find((option) => option.id === resourceFilter)?.label}
            </summary>
            <div className="absolute left-0 top-full z-30 mt-2 w-48 rounded-2xl bg-white p-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setResourceFilter(option.id)}
                  className={[
                    'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium transition-colors',
                    resourceFilter === option.id
                      ? 'bg-accent-muted text-accent'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
                  ].join(' ')}
                >
                  <span>{option.label}</span>
                  <span className="text-[12px] tabular-nums">{option.count}</span>
                </button>
              ))}
            </div>
          </details>
        )}
      </header>

      {isLoading ? (
        <LoadingPlaceholder variant="module-grid" />
      ) : !hasAnyResults ? (
        <EmptyPlaceholder
          title="Ничего не найдено"
          description="Попробуйте изменить запрос или добавить материалы в библиотеку."
        />
      ) : (
        <>
          {activeTab === 'favorites' && favoriteCount > 0 && (
            <Section>
              {resourceFilter === 'modules' && favoriteModules.length > 0 && (
                <div className="mb-5">
                  <ModuleGrid modules={favoriteModules} currentUserId={user?.id} />
                </div>
              )}
              {resourceFilter === 'diagrams' && favoriteDiagrams.length > 0 && <DiagramGrid diagrams={favoriteDiagrams} />}
            </Section>
          )}

          {activeTab === 'folders' && filteredFolders.length > 0 && (
            <Section>
              <CardGrid>
                {filteredFolders.map((folder) => {
                  const folderModules = modulesByFolder.get(folder.id) ?? []
                  const previewColors = folderModules.map((module) =>
                    resolveModuleBaseColor(module.id, module.color),
                  )

                  return (
                    <div key={folder.id} className="flex justify-center sm:justify-start">
                      <FolderCard folder={folder} previewColors={previewColors} />
                    </div>
                  )
                })}
              </CardGrid>
            </Section>
          )}

          {activeTab === 'modules' && ownModules.length > 0 && (
            <Section>
              <ModuleGrid modules={ownModules} currentUserId={user?.id} />
            </Section>
          )}

          {activeTab === 'diagrams' && filteredDiagrams.length > 0 && (
            <Section>
              <DiagramGrid diagrams={filteredDiagrams} />
            </Section>
          )}

          {activeTab === 'linked' && linkedCount > 0 && (
            <Section>
              {resourceFilter === 'modules' && linkedModules.length > 0 && (
                <ModuleGrid modules={linkedModules} currentUserId={user?.id} />
              )}
              {resourceFilter === 'diagrams' && linkedDiagrams.length > 0 && (
                <DiagramGrid diagrams={linkedDiagrams} />
              )}
            </Section>
          )}

          {(tabs.find((tab) => tab.id === activeTab)?.count === 0 ||
            (showResourceFilter &&
              filterOptions.find((option) => option.id === resourceFilter)?.count === 0)) && (
            <EmptyPlaceholder
              title="В этом разделе пока пусто"
              description="Попробуйте другой раздел или измените поисковый запрос."
            />
          )}
        </>
      )}
    </PageLayout>
  )
}
