import { LayoutGrid } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCardColorTheme, resolveModuleBaseColor } from '../../lib/cardColor'
import { getStudyModeById, type StudyModeId } from '../../types/studyMode'
import type { Module } from '../../types/module'

interface ModuleStudyHeaderProps {
  module: Module
  activeMode?: StudyModeId | null
  onBackToModes?: () => void
}

export function ModuleStudyHeader({
  module,
  activeMode,
  onBackToModes,
}: ModuleStudyHeaderProps) {
  const accent = getCardColorTheme(resolveModuleBaseColor(module.id, module.color)).base
  const activeModeMeta = getStudyModeById(activeMode)

  return (
    <header className="mb-8">
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
        <Link
          to="/library"
          className="font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Библиотека
        </Link>
        <span className="text-text-tertiary">/</span>
        <span className="font-medium text-text-primary">{module.title}</span>
        {activeModeMeta && (
          <>
            <span className="text-text-tertiary">/</span>
            <span className="font-medium text-[#6366f1]">{activeModeMeta.title}</span>
          </>
        )}
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            {module.category}
          </p>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.03em] text-text-primary sm:text-[32px]">
            {module.title}
          </h1>
          {module.description && (
            <p className="mt-2 max-w-[640px] text-[14px] leading-relaxed text-text-secondary">
              {module.description}
            </p>
          )}
        </div>
        <div
          className="h-2 w-16 shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
      </div>

      {activeMode && onBackToModes ? (
        <button
          type="button"
          onClick={onBackToModes}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#6366f1]/25 bg-[#6366f1]/8 px-4 py-2.5 text-[13px] font-medium text-[#6366f1] transition-colors hover:bg-[#6366f1]/12"
        >
          <LayoutGrid size={15} strokeWidth={1.75} />
          Все методы заучивания
        </button>
      ) : (
        <a
          href="#study-modes"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-surface-subtle/80 px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-[#d4d9e0] hover:text-text-primary"
        >
          <LayoutGrid size={15} strokeWidth={1.75} />
          Выбрать метод заучивания ↓
        </a>
      )}
    </header>
  )
}
