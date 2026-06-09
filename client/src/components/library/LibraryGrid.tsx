import { resolveModuleBaseColor } from '../../lib/cardColor'
import type { LibraryFolder } from '../../types/library'
import type { Module } from '../../types/module'
import { useNavigate } from 'react-router-dom'
import { FolderCard, FOLDER_CARD_WIDTH } from '../ui/FolderCard'
import { MODULE_CARD_HEIGHT, MODULE_CARD_WIDTH, ModuleCard } from '../ui/ModuleCard'

const GRID_MIN_WIDTH = Math.max(MODULE_CARD_WIDTH, FOLDER_CARD_WIDTH)

interface LibraryGridProps {
  folders: LibraryFolder[]
  modules: Module[]
  modulesByFolder: Map<string, Module[]>
  currentUserId?: string
  isLoading?: boolean
}

function CardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-[22px] bg-surface-muted/80"
      style={{ width: MODULE_CARD_WIDTH, height: MODULE_CARD_HEIGHT }}
    />
  )
}

export function LibraryGrid({
  folders,
  modules,
  modulesByFolder,
  currentUserId,
  isLoading,
}: LibraryGridProps) {
  const navigate = useNavigate()
  if (isLoading) {
    return (
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_WIDTH}px, 1fr))` }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex justify-center sm:justify-start">
            <CardSkeleton />
          </div>
        ))}
      </div>
    )
  }

  const isEmpty = folders.length === 0 && modules.length === 0

  if (isEmpty) {
    return (
      <div className="rounded-[22px] border border-dashed border-border bg-surface-subtle/40 px-6 py-16 text-center">
        <p className="text-[15px] font-medium text-text-primary">Ничего не найдено</p>
        <p className="mt-1 text-[13px] text-text-secondary">
          Измените запрос или выберите другой тип
        </p>
      </div>
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
