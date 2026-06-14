import { useMemo, useState } from 'react'
import { LibraryGrid } from '../components/library/LibraryGrid'
import { LibrarySearch, type LibraryScope } from '../components/library/LibrarySearch'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { CreateDropdown } from '../components/ui/CreateDropdown'
import {
  useGetCurrentUserQuery,
  useGetLibraryFoldersQuery,
  useGetLibraryModulesQuery,
} from '../store/api/modulesApi'
import type { LibraryFolder } from '../types/library'
import type { Module } from '../types/module'

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase()
}

function matchesFolder(folder: LibraryFolder, query: string): boolean {
  if (!query) return true
  return (
    folder.name.toLowerCase().includes(query) ||
    folder.description.toLowerCase().includes(query)
  )
}

function matchesModule(module: Module, query: string): boolean {
  if (!query) return true
  return (
    module.title.toLowerCase().includes(query) ||
    module.category.toLowerCase().includes(query) ||
    module.description.toLowerCase().includes(query) ||
    module.previewWords.some((word) => word.toLowerCase().includes(query))
  )
}

export function LibraryPage() {
  const { data: user } = useGetCurrentUserQuery()
  const { data: modules, isLoading: modulesLoading } = useGetLibraryModulesQuery()
  const { data: folders, isLoading: foldersLoading } = useGetLibraryFoldersQuery()

  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<LibraryScope>('all')

  const normalizedQuery = normalizeQuery(query)
  const isLoading = modulesLoading || foldersLoading

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

  const filteredFolders = useMemo(() => {
    if (scope === 'modules') return []
    return (folders ?? []).filter((folder) => matchesFolder(folder, normalizedQuery))
  }, [folders, normalizedQuery, scope])

  const filteredModules = useMemo(() => {
    if (scope === 'folders') return []
    const source = scope === 'all' ? rootModules : (modules ?? [])
    return source.filter((module) => matchesModule(module, normalizedQuery))
  }, [modules, rootModules, normalizedQuery, scope])

  const resultCount = filteredFolders.length + filteredModules.length

  return (
    <PageLayout>
      <header className="mb-8">
        <PageBreadcrumbs
          items={[{ label: 'Главная', to: '/' }, { label: 'Библиотека' }]}
          className="mb-4"
        />
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="mb-2 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary lg:text-[34px]">
              Моя библиотека
            </h1>
            <p className="text-[15px] leading-relaxed text-text-secondary">
              Папки и модули в одном месте
            </p>
          </div>
          <CreateDropdown />
        </div>

        <LibrarySearch
          query={query}
          scope={scope}
          resultCount={resultCount}
          onQueryChange={setQuery}
          onScopeChange={setScope}
        />
      </header>

      <LibraryGrid
        folders={filteredFolders}
        modules={filteredModules}
        modulesByFolder={modulesByFolder}
        currentUserId={user?.id}
        isLoading={isLoading}
      />
    </PageLayout>
  )
}
