import { useMemo } from 'react'
import { LibraryGrid } from '../components/library/LibraryGrid'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import {
  useGetCurrentUserQuery,
  useGetLibraryFoldersQuery,
  useGetLibraryModulesQuery,
} from '../store/api/modulesApi'
import type { Module } from '../types/module'

export function LibraryPage() {
  const { data: user } = useGetCurrentUserQuery()
  const { data: modules, isLoading: modulesLoading } = useGetLibraryModulesQuery()
  const { data: folders, isLoading: foldersLoading } = useGetLibraryFoldersQuery()

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
            Папки и модули в одном месте
          </p>
        </div>
      </header>

      <LibraryGrid
        folders={folders ?? []}
        modules={rootModules}
        modulesByFolder={modulesByFolder}
        currentUserId={user?.id}
        isLoading={isLoading}
      />
    </PageLayout>
  )
}
