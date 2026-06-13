import { Search, X } from 'lucide-react'
import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react'

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'size'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onClear?: () => void
  clearable?: boolean
  wrapperClassName?: string
}

const inputClass = [
  'h-11 w-full rounded-2xl border border-border bg-white pl-11 pr-10 text-[14px] text-text-primary shadow-[0_1px_2px_rgba(26,29,33,0.03)]',
  'placeholder:text-text-tertiary',
  'transition-[border-color,background-color] duration-200',
  'hover:border-text-tertiary/40 hover:bg-surface-subtle/30',
  'focus:border-text-tertiary focus:bg-white focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    value: controlledValue,
    defaultValue = '',
    onValueChange,
    onChange,
    onClear,
    placeholder = 'Поиск…',
    clearable = true,
    className = '',
    wrapperClassName = '',
    id: externalId,
    type = 'search',
    disabled,
    ...inputProps
  },
  ref,
) {
  const fallbackId = useId()
  const id = externalId ?? fallbackId
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue

  useEffect(() => {
    if (!isControlled) setUncontrolledValue(defaultValue)
  }, [defaultValue, isControlled])

  const setValue = (next: string) => {
    if (!isControlled) setUncontrolledValue(next)
    onValueChange?.(next)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    onChange?.(event)
  }

  const handleClear = () => {
    setValue('')
    onClear?.()
  }

  return (
    <div className={['relative', wrapperClassName].filter(Boolean).join(' ')}>
      <Search
        size={16}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
        aria-hidden
      />
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={[inputClass, className].filter(Boolean).join(' ')}
        {...inputProps}
      />
      {clearable && value && !disabled && (
        <button
          type="button"
          onPointerDown={(e) => e.preventDefault()}
          onClick={handleClear}
          className={[
            'absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-text-tertiary transition-colors',
            'hover:bg-surface-muted hover:text-text-secondary',
          ].join(' ')}
          aria-label="Очистить поиск"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
})
