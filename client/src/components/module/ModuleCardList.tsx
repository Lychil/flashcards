import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  Volume2,
  X,
} from 'lucide-react'
import { useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { CARD_SRS_CHOICES } from '../../lib/cardSrsChoice'
import { filterCardsByTab, getCardStats, matchesCardSearch } from '../../lib/cardFilter'
import { enrichFlashcards } from '../../lib/enrichFlashcards'
import { getAccentForeground } from '../../lib/cardColor'
import { speakText } from '../../lib/speakText'
import type { CardFilter, Flashcard } from '../../types/flashcard'
import { SearchBar } from '../ui/SearchBar'
import { EmptyPlaceholder } from '../ui/ContentPlaceholder'
import { Tooltip } from '../ui/Tooltip'
import { CardSrsBadge } from './CardSrsBadge'
import {
  moduleGhostButtonClass,
  moduleInteractiveClass,
  moduleLabelClass,
} from './moduleStyles'

const primaryButtonClass =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90'

const PAGE_SIZE = 20

const FILTER_OPTIONS: { id: CardFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  ...CARD_SRS_CHOICES.map(({ value, label }) => ({ id: value as CardFilter, label })),
]

const ROW_GRID =
  'grid grid-cols-[1fr] gap-x-3 gap-y-2 sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1.2fr)_8.5rem_auto] sm:items-center sm:gap-x-4'

type SortField = 'term' | 'definition'
type SortDir = 'asc' | 'desc'

interface ModuleCardListProps {
  cards: Flashcard[]
  accentColor: string
  filter: CardFilter
  onFilterChange: (filter: CardFilter) => void
  onAdd: (card: Omit<Flashcard, 'id'>) => void
  onUpdate: (id: string, patch: Partial<Omit<Flashcard, 'id'>>) => void
  onDelete: (ids: string[]) => void
  className?: string
}

export function ModuleCardList({
  cards,
  accentColor,
  filter,
  onFilterChange,
  onAdd,
  onUpdate,
  onDelete,
  className = '',
}: ModuleCardListProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState<SortField>('term')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [term, setTerm] = useState('')
  const [definition, setDefinition] = useState('')

  const enriched = useMemo(() => enrichFlashcards(cards), [cards])
  const filterCounts = useMemo(() => {
    const stats = getCardStats(enriched)
    return {
      all: stats.total,
      know: stats.know,
      repeat: stats.repeat,
      dont_know: stats.dont_know,
    }
  }, [enriched])

  const filtered = useMemo(() => {
    const byTab = filterCardsByTab(enriched, filter)

    const searched = byTab.filter((card) => matchesCardSearch(card, search))

    return [...searched].sort((a, b) => {
      const left = sortField === 'term' ? a.term : a.definition
      const right = sortField === 'term' ? b.term : b.definition
      const cmp = left.localeCompare(right, 'ru', { sensitivity: 'base' })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [enriched, filter, search, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const resetForm = () => {
    setTerm('')
    setDefinition('')
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedTerm = term.trim()
    const trimmedDef = definition.trim()
    if (!trimmedTerm || !trimmedDef) return

    if (editingId) {
      onUpdate(editingId, { term: trimmedTerm, definition: trimmedDef })
    } else {
      onAdd({ term: trimmedTerm, definition: trimmedDef })
    }

    resetForm()
  }

  const startEdit = (card: Flashcard) => {
    setEditingId(card.id)
    setTerm(card.term)
    setDefinition(card.definition)
    setShowAddForm(true)
  }

  const handleFilterChange = (next: CardFilter) => {
    onFilterChange(next)
    setPage(0)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(0)
  }

  const accentFg = getAccentForeground(accentColor)
  const accentButtonStyle = { backgroundColor: accentColor, color: accentFg.primary }
  const accentRingStyle = { '--tw-ring-color': `${accentColor}26` } as CSSProperties

  return (
    <section className={className}>
      <div>
        <div className="mb-4">
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-text-primary">Карточки</h2>
        </div>

        <div className="mb-4">
          <SearchBar
            value={search}
            onValueChange={handleSearchChange}
            placeholder="Поиск по содержимому карточек…"
          />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleFilterChange(option.id)}
                className={[
                  'cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-opacity hover:opacity-90',
                  filter !== option.id &&
                    'bg-surface-subtle text-text-secondary hover:bg-surface-muted hover:text-text-primary hover:opacity-100',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={filter === option.id ? accentButtonStyle : undefined}
              >
                {option.label} ({filterCounts[option.id]})
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (showAddForm && !editingId) {
                resetForm()
              } else {
                setEditingId(null)
                setTerm('')
                setDefinition('')
                setShowAddForm((v) => !v)
              }
            }}
            className={showAddForm && !editingId ? moduleGhostButtonClass : primaryButtonClass}
            style={showAddForm && !editingId ? undefined : accentButtonStyle}
          >
            {showAddForm && !editingId ? (
              <>
                <X size={15} strokeWidth={2} />
                Отмена
              </>
            ) : (
              <>
                <Plus size={15} strokeWidth={2} />
                Добавить
              </>
            )}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-5 space-y-4 rounded-2xl bg-surface-subtle p-4">
            <p className={moduleLabelClass}>{editingId ? 'Редактировать' : 'Новая карточка'}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Лицевая сторона
                </span>
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Текст лицевой стороны"
                  className="w-full rounded-2xl bg-white/80 px-4 py-3 text-[14px] text-text-primary outline-none focus:bg-white focus:ring-2"
                  style={accentRingStyle}
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-text-primary">
                  Обратная сторона
                </span>
                <input
                  type="text"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  placeholder="Текст обратной стороны"
                  className="w-full rounded-2xl bg-white/80 px-4 py-3 text-[14px] text-text-primary outline-none focus:bg-white focus:ring-2"
                  style={accentRingStyle}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!term.trim() || !definition.trim()}
                className={`${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                style={accentButtonStyle}
              >
                {editingId ? 'Сохранить' : 'Добавить карточку'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className={moduleGhostButtonClass}>
                  Отмена
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {cards.length === 0 ? (
        <EmptyPlaceholder
          variant="inline"
          title="Карточек пока нет"
          description='Нажмите «Добавить», чтобы создать первую'
        />
      ) : filtered.length === 0 ? (
        <EmptyPlaceholder
          variant="inline"
          title="Ничего не найдено"
          description="Измените запрос или фильтр"
        />
      ) : (
        <>
          <div className="relative z-0 mb-2 hidden px-4 sm:grid sm:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1.2fr)_8.5rem_auto] sm:gap-x-4">
            <span className={moduleLabelClass}>#</span>
            <SortHeader
              label="Лицевая сторона"
              active={sortField === 'term'}
              dir={sortDir}
              onClick={() => toggleSort('term')}
            />
            <SortHeader
              label="Обратная сторона"
              active={sortField === 'definition'}
              dir={sortDir}
              onClick={() => toggleSort('definition')}
            />
            <span className={moduleLabelClass}>Статус</span>
            <span className={`${moduleLabelClass} text-right`}>Действия</span>
          </div>

          <ul className="space-y-1 pb-2">
            {pageItems.map((card, index) => {
              const rowNumber = safePage * PAGE_SIZE + index + 1

              return (
                <li
                  key={card.id}
                  className="group rounded-2xl px-3 py-3.5 transition-colors hover:bg-surface-subtle sm:px-4"
                >
                  <div className={ROW_GRID}>
                    <span className="hidden text-[13px] font-semibold tabular-nums text-text-tertiary sm:block">
                      {rowNumber}
                    </span>

                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2 sm:mb-0">
                        <span className="text-[12px] font-semibold tabular-nums text-text-tertiary sm:hidden">
                          {rowNumber}.
                        </span>
                        <p className="text-[15px] font-semibold leading-snug text-text-primary">
                          {card.term}
                        </p>
                        <button
                          type="button"
                          onClick={() => speakText(card.term)}
                          className={[
                            'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-tertiary opacity-0 transition-opacity',
                            moduleInteractiveClass,
                            'group-hover:opacity-100 hover:bg-surface-muted hover:text-text-primary',
                          ].join(' ')}
                          aria-label={`Произнести «${card.term}»`}
                        >
                          <Volume2 size={15} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    <p className="min-w-0 text-[14px] leading-[1.65] text-text-secondary">
                      {card.definition}
                    </p>

                    {card.sourceRef && (
                      <p
                        className="col-span-full mt-1 line-clamp-1 text-[12px] text-text-tertiary sm:col-span-3"
                        title={card.sourceRef.excerpt}
                      >
                        Источник: «{card.sourceRef.excerpt}»
                      </p>
                    )}

                    <CardSrsBadge card={card} className="sm:justify-self-start" />

                    <div className="flex items-center gap-0.5 opacity-40 transition-opacity group-hover:opacity-100 sm:justify-end">
                      <IconAction label="Редактировать" onClick={() => startEdit(card)}>
                        <Pencil size={15} strokeWidth={2} />
                      </IconAction>
                      <IconAction label="Удалить" onClick={() => onDelete([card.id])} danger>
                        <Trash2 size={15} strokeWidth={2} />
                      </IconAction>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between gap-3 pt-2">
              <p className="text-[13px] font-medium text-text-secondary">
                {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}{' '}
                из {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <PaginationButton
                  label="Предыдущая страница"
                  disabled={safePage === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </PaginationButton>
                <span className="min-w-[4.5rem] text-center text-[13px] font-semibold tabular-nums text-text-primary">
                  {safePage + 1} / {totalPages}
                </span>
                <PaginationButton
                  label="Следующая страница"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </PaginationButton>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  const SortIcon = active ? (dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group/sort inline-flex cursor-pointer items-center gap-1.5 text-left',
        moduleLabelClass,
        'transition-colors hover:text-text-primary',
        active ? 'text-text-primary' : '',
      ].join(' ')}
    >
      {label}
      <SortIcon
        size={13}
        strokeWidth={2}
        className={[
          'shrink-0 text-text-tertiary transition-opacity',
          active ? 'opacity-100' : 'opacity-0 group-hover/sort:opacity-100',
        ].join(' ')}
      />
    </button>
  )
}

function IconAction({
  children,
  label,
  onClick,
  danger,
}: {
  children: ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <Tooltip label={label} side="bottom" align="end">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={[
          'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors',
          moduleInteractiveClass,
          danger
            ? 'text-text-tertiary hover:bg-surface-muted hover:text-[#b04472]'
            : 'text-text-tertiary hover:bg-surface-muted hover:text-text-primary',
        ].join(' ')}
      >
        {children}
      </button>
    </Tooltip>
  )
}

function PaginationButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-text-secondary transition-colors',
        moduleInteractiveClass,
        'hover:bg-surface-subtle hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-35',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
