import {
  useCallback,
  useEffect,
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
  /** hover — только наведение; click — только клик; both — оба (клик закрепляет) */
  trigger?: 'hover' | 'click' | 'both'
}

export function Tooltip({
  label,
  children,
  side = 'bottom',
  align = 'center',
  trigger = 'hover',
}: TooltipProps) {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const [style, setStyle] = useState<CSSProperties>({})
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tooltipId = useId()

  const open = pinnedOpen || (trigger !== 'click' && hoverOpen)

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const gap = 8
    const viewportPad = 12

    let top = side === 'bottom' ? rect.bottom + gap : rect.top - gap
    let left: number
    let transform: string

    if (side === 'bottom') {
      if (align === 'start') {
        left = Math.max(viewportPad, rect.left)
        transform = 'translate(0, 0)'
      } else if (align === 'end') {
        left = Math.min(window.innerWidth - viewportPad, rect.right)
        transform = 'translate(-100%, 0)'
      } else {
        left = rect.left + rect.width / 2
        transform = 'translate(-50%, 0)'
      }
    } else {
      if (align === 'start') {
        left = Math.max(viewportPad, rect.left)
        transform = 'translate(0, -100%)'
      } else if (align === 'end') {
        left = Math.min(window.innerWidth - viewportPad, rect.right)
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

  useEffect(() => {
    if (!open) return
    updatePosition()
    const onScroll = () => updatePosition()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!pinnedOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) {
        setPinnedOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [pinnedOpen])

  const showHover = () => {
    if (trigger === 'click') return
    updatePosition()
    setHoverOpen(true)
  }

  const hideHover = () => {
    if (trigger === 'click') return
    setHoverOpen(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (trigger === 'hover') return
    e.preventDefault()
    e.stopPropagation()
    updatePosition()
    setPinnedOpen((v) => !v)
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex shrink-0"
        onMouseEnter={showHover}
        onMouseLeave={hideHover}
        onFocus={showHover}
        onBlur={hideHover}
        onClick={handleClick}
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
            className="pointer-events-none max-w-[min(280px,calc(100vw-1.5rem))] whitespace-normal rounded-xl bg-[#12151a] px-3 py-2 text-[12px] font-medium leading-snug text-white"
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  )
}
