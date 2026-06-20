import { resolveModuleBaseColor } from '../../lib/cardColor'
import type { LibraryFolder } from '../../types/library'
import type { Module } from '../../types/module'
import { useNavigate } from 'react-router-dom'
import { EmptyPlaceholder, LoadingPlaceholder } from '../ui/ContentPlaceholder'
import { FolderCard, FOLDER_CARD_WIDTH } from '../ui/FolderCard'
import { MODULE_CARD_WIDTH, ModuleCard } from '../ui/ModuleCard'

const GRID_MIN_WIDTH = Math.max(MODULE_CARD_WIDTH, FOLDER_CARD_WIDTH)

interface LibraryGridProps {
  folders: LibraryFolder[]
  modules: Module[]
  modulesByFolder: Map<string, Module[]>
  currentUserId?: string
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function LibraryGrid({
  folders,
  modules,
  modulesByFolder,
  currentUserId,
  isLoading,
  emptyTitle = 'Ничего не найдено',
  emptyDescription = 'Измените запрос или выберите другой тип',
}: LibraryGridProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return <LoadingPlaceholder variant="module-grid" />
  }

  const isEmpty = folders.length === 0 && modules.length === 0

  if (isEmpty) {
    return (
      <EmptyPlaceholder
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_WIDTH}px, 1fr))` }}
    >
      {folders.map((folder) => {
        const folderModules = modulesByFolder.get(folder.id) ?? []
        const previewColors = folderModules.map((m) =>
          resolveModuleBaseColor(m.id, m.color),
        )

        return (
          <div key={folder.id} className="flex justify-center sm:justify-start">
            <FolderCard folder={folder} previewColors={previewColors} />
          </div>
        )
      })}
      {modules.map((module) => (
        <div key={module.id} className="flex justify-center sm:justify-start">
          <ModuleCard
            module={module}
            currentUserId={currentUserId}
            onClick={() => navigate(`/module/${module.id}`)}
          />
        </div>
      ))}
    </div>
  )
}
