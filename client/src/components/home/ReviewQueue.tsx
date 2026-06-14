import { FileText, ImageIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCardColorTheme, resolveModuleBaseColor } from '../../lib/cardColor'
import { formatLastReviewed } from '../../lib/formatRelativeTime'
import { pluralizeCards } from '../../lib/pluralizeRu'
import type { Module } from '../../types/module'
import { homeCardClass, moduleInteractiveClass } from './homeStyles'

interface ReviewQueueProps {
  modules: Module[]
}

export function ReviewQueue({ modules }: ReviewQueueProps) {
  const navigate = useNavigate()

  if (modules.length === 0) return null

  return (
    <div className={`p-4 ${homeCardClass}`}>
      <ul className="flex flex-col gap-1.5">
        {modules.map((module) => {
          const isInteractive = module.type === 'interactive'
          const theme = getCardColorTheme(resolveModuleBaseColor(module.id, module.color))

          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => navigate(`/module/${module.id}`)}
                className={[
                  'flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-surface-subtle/50 px-3 py-3 text-left',
                  moduleInteractiveClass,
                  'hover:border-border hover:bg-white',
                ].join(' ')}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${theme.base}20`, color: theme.base }}
                >
                  {isInteractive ? (
                    <ImageIcon size={16} strokeWidth={1.5} />
                  ) : (
                    <FileText size={16} strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-text-primary">
                    {module.title}
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    {formatLastReviewed(module.lastReviewedAt)} · {module.wordCount}{' '}
                    {pluralizeCards(module.wordCount)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className="text-[12px] font-semibold tabular-nums"
                    style={{ color: theme.base }}
                  >
                    {module.progress}%
                  </span>
                  <div className="h-1 w-10 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${module.progress}%`, backgroundColor: theme.base }}
                    />
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
