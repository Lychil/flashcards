import {
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
}

export function Tooltip({
  label,
  children,
  side = 'bottom',
  align = 'center',
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const gap = 6

    let top = side === 'bottom' ? rect.bottom + gap : rect.top - gap
    let left: number
    let transform: string

    if (side === 'bottom') {
      if (align === 'start') {
        left = rect.left
        transform = 'translate(0, 0)'
      } else if (align === 'end') {
        left = rect.right
        transform = 'translate(-100%, 0)'
      } else {
        left = rect.left + rect.width / 2
        transform = 'translate(-50%, 0)'
      }
    } else {
      if (align === 'start') {
        left = rect.left
        transform = 'translate(0, -100%)'
      } else if (align === 'end') {
        left = rect.right
        transform = 'translate(-100%, -100%)'
      } else {
        left = rect.left + rect.width / 2
        transform = 'translate(-50%, -100%)'
      }
    }

    setStyle({
      position: 'fixed',
      top,
      left,
      transform,
      zIndex: 99999,
    })
  }, [side, align])

  const show = () => {
    updatePosition()
    setOpen(true)
  }

  const hide = () => setOpen(false)

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={open ? tooltipId : undefined}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={style}
            className="pointer-events-none max-w-[min(280px,calc(100vw-1.5rem))] whitespace-normal rounded-lg bg-[#12151a] px-2.5 py-1.5 text-[11px] font-medium leading-snug text-white shadow-lg"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  )
}
