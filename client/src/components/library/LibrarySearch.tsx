import { pluralizeRu } from '../../lib/pluralizeRu'
import { statsLabelClass } from '../stats/statsStyles'
import { SearchBar } from '../ui/SearchBar'

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
      <SearchBar
        value={query}
        onValueChange={onQueryChange}
        placeholder="Искать папки и модули…"
        autoFocus
      />

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
                  ? 'bg-surface-subtle text-text-primary'
                  : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className={`${statsLabelClass} normal-case tracking-normal`}>
          {resultCount}{' '}
          {pluralizeRu(resultCount, ['результат', 'результата', 'результатов'])}
        </p>
      </div>
    </div>
  )
}
