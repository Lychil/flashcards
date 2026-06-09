import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SearchBarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = 'Поиск по модулям...',
  className = '',
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('')
  const value = controlledValue ?? internalValue

  const handleChange = (next: string) => {
    setInternalValue(next)
    onChange?.(next)
  }

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue)
    }
  }, [controlledValue])

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
        strokeWidth={1.5}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'w-full h-11 pl-10 pr-9',
          'bg-surface border border-border rounded-[10px]',
          'text-text-primary text-[13px] placeholder:text-text-tertiary',
          'transition-all duration-200',
          'hover:border-text-tertiary/50',
          'focus:outline-none focus:border-accent/60 focus:ring-[3px] focus:ring-accent/8',
        ].join(' ')}
      />
      {value && (
        <button
          type="button"
          onClick={() => handleChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-text-tertiary hover:text-text-secondary transition-colors duration-200"
          aria-label="Очистить поиск"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      )}
    </div>
  )
}
