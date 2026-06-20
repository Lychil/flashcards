import { FileText, ImageIcon } from 'lucide-react'
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { searchGlobalModules } from '../../lib/globalModuleSearch'
import { useGetGlobalModulesQuery } from '../../store/api/modulesApi'
import type { Module } from '../../types/module'
import { SearchBar } from '../ui/SearchBar'

interface SuggestionItemProps {
  item: Module
  index: number
  listboxId: string
  isKeyboardActive: boolean
  onSelect: (index: number) => void
  onHover: (index: number) => void
}

const SuggestionItem = memo(function SuggestionItem({
  item,
  index,
  listboxId,
  isKeyboardActive,
  onSelect,
  onHover,
}: SuggestionItemProps) {
  const isInteractive = item.type === 'interactive'

  return (
    <li
      id={`${listboxId}-option-${index}`}
      role="option"
      aria-selected={isKeyboardActive}
      onPointerDown={(e) => e.preventDefault()}
      onPointerEnter={() => onHover(index)}
      onClick={() => onSelect(index)}
      data-keyboard-active={isKeyboardActive || undefined}
      className={[
        'flex cursor-pointer items-center gap-3 rounded-lg px-4 py-2.5',
        'hover:bg-surface-muted',
        'data-[keyboard-active]:bg-accent-muted data-[keyboard-active]:text-accent',
      ].join(' ')}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-tertiary">
        {isInteractive ? (
          <ImageIcon size={15} strokeWidth={1.5} />
        ) : (
          <FileText size={15} strokeWidth={1.5} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-text-primary">{item.title}</p>
        <p className="mt-0.5 text-[11px] text-text-tertiary">{item.category}</p>
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-text-tertiary">
        ★ {item.rating.toFixed(1)}
      </span>
    </li>
  )
})

export function AppGlobalSearch() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const hoveredIndexRef = useRef(0)
  const { data } = useGetGlobalModulesQuery()
  const isGlobalPage = location.pathname === '/global'
  const urlQuery = searchParams.get('q') ?? ''
  const [localQuery, setLocalQuery] = useState('')
  const query = isGlobalPage ? urlQuery : localQuery
  const [isOpen, setIsOpen] = useState(false)
  const [keyboardIndex, setKeyboardIndex] = useState(0)
  const [keyboardNav, setKeyboardNav] = useState(false)

  useEffect(() => {
    if (!isGlobalPage) setLocalQuery('')
  }, [isGlobalPage, location.pathname])

  const suggestions = useMemo(() => {
    if (!data || !query.trim()) return []
    return searchGlobalModules(data.modules, data.currentUserId, query, 6)
  }, [data, query])

  useEffect(() => {
    setKeyboardIndex(0)
    hoveredIndexRef.current = 0
    setKeyboardNav(false)
  }, [query])

  useEffect(() => {
    if (keyboardIndex >= suggestions.length) {
      setKeyboardIndex(Math.max(0, suggestions.length - 1))
    }
  }, [keyboardIndex, suggestions.length])

  const open = isOpen && query.trim().length > 0 && suggestions.length > 0

  const setQuery = (next: string) => {
    if (isGlobalPage) {
      setSearchParams(next ? { q: next } : {}, { replace: true })
      return
    }
    setLocalQuery(next)
  }

  const goToGlobalSearch = (nextQuery = query) => {
    const trimmed = nextQuery.trim()
    setIsOpen(false)
    navigate(trimmed ? `/global?q=${encodeURIComponent(trimmed)}` : '/global')
  }

  const selectSuggestion = (index: number) => {
    const item = suggestions[index]
    if (!item) return
    setIsOpen(false)
    navigate(`/module/${item.id}`)
  }

  const handleHover = (index: number) => {
    hoveredIndexRef.current = index
    if (keyboardNav) setKeyboardNav(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) setIsOpen(true)
      setKeyboardNav(true)
      setKeyboardIndex((i) => Math.min(i + 1, suggestions.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) setIsOpen(true)
      setKeyboardNav(true)
      setKeyboardIndex((i) => Math.max(i - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      goToGlobalSearch()
      return
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative w-full">
      <SearchBar
        ref={inputRef}
        size="compact"
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && keyboardNav ? `${listboxId}-option-${keyboardIndex}` : undefined
        }
        value={query}
        placeholder="Искать модули по названию, предмету или автору…"
        onValueChange={(next) => {
          setQuery(next)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        onClear={() => {
          setQuery('')
          setIsOpen(true)
          inputRef.current?.focus()
        }}
      />

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className={[
            'absolute left-0 right-0 top-full z-30 mt-2',
            'overflow-hidden rounded-xl border border-border bg-white py-1.5 shadow-sm',
          ].join(' ')}
        >
          {suggestions.map((item, index) => (
            <SuggestionItem
              key={item.id}
              item={item}
              index={index}
              listboxId={listboxId}
              isKeyboardActive={keyboardNav && index === keyboardIndex}
              onSelect={selectSuggestion}
              onHover={handleHover}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
