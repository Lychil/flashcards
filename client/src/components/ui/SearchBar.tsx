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
  size?: 'default' | 'compact'
}

const inputBaseClass = [
  'w-full border border-border bg-white text-text-primary',
  'placeholder:text-text-tertiary',
  'transition-[border-color,background-color] duration-200',
  'hover:border-text-tertiary/40 hover:bg-surface-subtle/30',
  'focus:border-text-tertiary focus:bg-white focus:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-60',
].join(' ')

/** Plain text field — same surface as SearchBar, without icon padding */
export const textFieldInputClass = [
  inputBaseClass,
  'h-12 rounded-2xl px-4 text-[14px]',
].join(' ')

const sizeClass = {
  default: 'h-12 rounded-2xl pl-11 pr-10 text-[14px]',
  compact: 'h-10 rounded-xl pl-10 pr-9 text-[13px]',
} as const

const iconClass = {
  default: 'left-4',
  compact: 'left-3.5',
} as const

const iconSize = {
  default: 16,
  compact: 15,
} as const

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
    size = 'default',
    id: externalId,
    type = 'text',
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

  // Native `type="search"` clear control duplicates our custom button.
  const inputType = clearable && type === 'search' ? 'text' : type

  return (
    <div className={['relative', wrapperClassName].filter(Boolean).join(' ')}>
      <Search
        size={iconSize[size]}
        strokeWidth={1.75}
        className={[
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-tertiary',
          iconClass[size],
        ].join(' ')}
        aria-hidden
      />
      <input
        ref={ref}
        id={id}
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={[inputBaseClass, sizeClass[size], className].filter(Boolean).join(' ')}
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
