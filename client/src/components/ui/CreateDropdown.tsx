import { ChevronDown, FileText, Folder, Map, Plus } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'

interface CreateOption {
  id: string
  label: string
  description: string
  to: string
  icon: typeof Folder
}

const MENU_WIDTH = 260
const VIEWPORT_PADDING = 16
const MENU_GAP = 8

const createOptions: CreateOption[] = [
  {
    id: 'folder',
    label: 'Папку',
    description: 'Сгруппировать модули по теме',
    to: '/create/folder',
    icon: Folder,
  },
  {
    id: 'module',
    label: 'Модуль',
    description: 'Текстовые или интерактивные карточки',
    to: '/create/module',
    icon: FileText,
  },
  {
    id: 'diagram',
    label: 'Диаграмму',
    description: 'Интерактивная схема для запоминания',
    to: '/create/diagram',
    icon: Map,
  },
]

export function CreateDropdown() {
  const menuId = useId()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})

  const updateMenuPosition = () => {
    const trigger = containerRef.current
    if (!trigger) return

    const rect = trigger.getBoundingClientRect()
    const maxLeft = window.innerWidth - VIEWPORT_PADDING - MENU_WIDTH
    const left = Math.min(Math.max(rect.right - MENU_WIDTH, VIEWPORT_PADDING), maxLeft)

    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + MENU_GAP,
      left,
      width: MENU_WIDTH,
      zIndex: 99999,
    })
  }

  useLayoutEffect(() => {
    if (!open) return undefined

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const selectOption = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'inline-flex items-center gap-2 cursor-pointer',
          'h-10 px-4 rounded-xl border border-border bg-white',
          'text-[13px] font-medium text-text-primary',
          'hover:border-text-tertiary/40 hover:bg-surface-subtle',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          open ? 'border-text-tertiary/40 bg-surface-subtle' : '',
        ].join(' ')}
      >
        <Plus size={15} strokeWidth={1.5} />
        Создать
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className={['text-text-tertiary transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
        />
      </button>

      {open &&
        createPortal(
          <ul
            ref={menuRef}
            id={menuId}
            role="menu"
            style={menuStyle}
            className={[
              'rounded-xl border border-border bg-white py-1.5',
              'shadow-[0_8px_24px_rgba(26,29,33,0.06)]',
            ].join(' ')}
          >
            {createOptions.map((option) => {
              const Icon = option.icon
              return (
                <li key={option.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => selectOption(option.to)}
                    className={[
                      'flex w-full items-start gap-3 px-3.5 py-2.5 cursor-pointer text-left',
                      'hover:bg-surface-muted',
                      'focus-visible:outline-none focus-visible:bg-accent-muted',
                    ].join(' ')}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-text-secondary">
                      <Icon size={15} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-text-primary">{option.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-text-tertiary">
                        {option.description}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </div>
  )
}
