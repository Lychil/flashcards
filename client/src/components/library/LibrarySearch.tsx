import { Search, X } from 'lucide-react'
import { pluralizeRu } from '../../lib/pluralizeRu'
import { homeLabelClass } from '../home/homeStyles'

export type LibraryScope = 'all' | 'folders' | 'modules'

const SCOPES: { id: LibraryScope; label: string }[] = [
  { id: 'all', label: 'Всё' },
  { id: 'folders', label: 'Папки' },
  { id: 'modules', label: 'Модули' },
]

interface LibrarySearchProps {
  query: string
  scope: LibraryScope
  resultCount: number
  onQueryChange: (value: string) => void
  onScopeChange: (scope: LibraryScope) => void
}

export function LibrarySearch({
  query,
  scope,
  resultCount,
  onQueryChange,
  onScopeChange,
}: LibrarySearchProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Искать папки и модули…"
          autoFocus
          className={[
            'w-full rounded-[20px] border border-border bg-white py-3.5 pl-12 pr-11 text-[15px] text-text-primary',
            'placeholder:text-text-tertiary shadow-[0_1px_2px_rgba(26,29,33,0.03)]',
            'transition-[border-color,box-shadow] duration-200',
            'hover:border-[#d4d9e0]',
            'focus:border-[#6366f1]/35 focus:outline-none focus:ring-4 focus:ring-[#6366f1]/10',
          ].join(' ')}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-surface-muted hover:text-text-secondary"
            aria-label="Очистить поиск"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SCOPES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onScopeChange(item.id)}
              className={[
                'cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200',
                scope === item.id
                  ? 'bg-[#eef2ff] text-[#6366f1]'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className={`${homeLabelClass} normal-case tracking-normal`}>
          {resultCount}{' '}
          {pluralizeRu(resultCount, ['результат', 'результата', 'результатов'])}
        </p>
      </div>
    </div>
  )
}
