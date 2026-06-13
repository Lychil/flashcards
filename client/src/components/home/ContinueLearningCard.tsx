import { ArrowRight, FileText, ImageIcon } from 'lucide-react'
import { getCardColorTheme, resolveModuleBaseColor } from '../../lib/cardColor'
import { formatLastReviewed } from '../../lib/formatRelativeTime'
import type { Module } from '../../types/module'
import { moduleInteractiveClass, moduleLabelClass } from './homeStyles'

interface ContinueLearningCardProps {
  module: Module
}

export function ContinueLearningCard({ module }: ContinueLearningCardProps) {
  const isInteractive = module.type === 'interactive'
  const theme = getCardColorTheme(resolveModuleBaseColor(module.id, module.color))

  return (
    <button
      type="button"
      className={[
        'group w-full cursor-pointer rounded-[22px] border border-border bg-white p-5 text-left',
        moduleInteractiveClass,
      ].join(' ')}
      style={{
        backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${theme.base}12 100%)`,
      }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${theme.base}22`, color: theme.base }}
          >
            {isInteractive ? (
              <ImageIcon size={20} strokeWidth={1.5} />
            ) : (
              <FileText size={20} strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <p className={`${moduleLabelClass} mb-1`}>Продолжить</p>
            <h3 className="mb-0.5 truncate text-[17px] font-semibold tracking-[-0.02em] text-text-primary">
              {module.title}
            </h3>
            <p className="text-[13px] text-text-secondary">
              {module.category} · {formatLastReviewed(module.lastReviewedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:min-w-[220px]">
          <div className="min-w-[140px] flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">Изучено</span>
              <span
                className="text-[13px] font-semibold tabular-nums"
                style={{ color: theme.base }}
              >
                {module.progress}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full transition-[width] duration-300"
                style={{ width: `${module.progress}%`, backgroundColor: theme.base }}
              />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-muted px-3 py-2 text-[13px] font-medium text-text-primary group-hover:bg-[#eef2ff] group-hover:text-[#6366f1]">
            Учить
            <ArrowRight
              size={15}
              strokeWidth={1.5}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </button>
  )
}
