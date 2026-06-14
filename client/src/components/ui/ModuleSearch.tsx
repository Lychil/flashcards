import { FileText, ImageIcon } from 'lucide-react'
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import { mockModules } from '../../store/api/modulesApi'
import type { Module } from '../../types/module'
import { SearchBar } from './SearchBar'

function filterModules(query: string): Module[] {
  const q = query.toLowerCase().trim()
  if (!q) return mockModules
  return mockModules.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q),
  )
}

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
        'flex items-center gap-3 px-4 py-2.5 cursor-pointer rounded-lg',
        'hover:bg-surface-muted',
        'data-[keyboard-active]:bg-accent-muted data-[keyboard-active]:text-accent',
      ].join(' ')}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-surface-muted text-text-tertiary">
        {isInteractive ? (
          <ImageIcon size={15} strokeWidth={1.5} />
        ) : (
          <FileText size={15} strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-text-primary truncate">{item.title}</p>
        <p className="text-[11px] text-text-tertiary mt-0.5">{item.category}</p>
      </div>
      <span className="text-[11px] text-text-tertiary shrink-0 tabular-nums">
        {item.progress}%
      </span>
    </li>
  )
})

export function ModuleSearch() {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const hoveredIndexRef = useRef(0)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [keyboardIndex, setKeyboardIndex] = useState(0)
  const [keyboardNav, setKeyboardNav] = useState(false)

  const suggestions = useMemo(() => filterModules(query), [query])

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

  const open = isOpen && suggestions.length > 0

  const getSelectedIndex = () => (keyboardNav ? keyboardIndex : hoveredIndexRef.current)

  const selectSuggestion = (index: number) => {
    const item = suggestions[index]
    if (!item) return
    setQuery(item.title)
    setIsOpen(false)
    inputRef.current?.focus()
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

    if (e.key === 'Tab' && open) {
      e.preventDefault()
      setKeyboardNav(true)
      const next = e.shiftKey
        ? (keyboardIndex - 1 + suggestions.length) % suggestions.length
        : (keyboardIndex + 1) % suggestions.length
      setKeyboardIndex(next)
      hoveredIndexRef.current = next
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (open) selectSuggestion(getSelectedIndex())
      return
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative mt-6 max-w-[480px]">
      <SearchBar
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && keyboardNav ? `${listboxId}-option-${keyboardIndex}` : undefined
        }
        value={query}
        placeholder="Найти модуль по названию или предмету..."
        onValueChange={(next) => {
          setQuery(next)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        onClear={() => {
          setIsOpen(true)
          inputRef.current?.focus()
        }}
      />

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className={[
            'absolute z-20 left-0 right-0 top-full mt-2',
            'bg-white border border-border rounded-xl',
            'shadow-[0_8px_24px_rgba(26,29,33,0.06)]',
            'py-1.5 overflow-hidden',
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
