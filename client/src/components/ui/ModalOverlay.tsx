import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalOverlayProps {
  open: boolean
  onClose: () => void
  title: string
  titleId?: string
  children: ReactNode
  maxWidthClass?: string
}

/**
 * Portal → body, поверх всего. Скролл оверлея, не внутренний блок.
 * Короткие модалки — по центру viewport; длинные — прокручиваются целиком.
 */
export function ModalOverlay({
  open,
  onClose,
  title,
  titleId,
  children,
  maxWidthClass = 'sm:max-w-2xl md:max-w-3xl lg:max-w-4xl',
}: ModalOverlayProps) {
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return undefined

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  if (!open) return null

  const headingId = titleId ?? 'modal-overlay-title'

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="presentation">
      <div className="fixed inset-0 bg-black/20" aria-hidden onClick={onClose} />

      <div
        className="fixed inset-0 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
        onClick={onClose}
      >
        <div
          className={[
            'flex min-h-[100dvh] flex-col justify-center',
            'px-4 py-[max(2rem,env(safe-area-inset-bottom,0px))] sm:px-0 sm:py-10',
          ].join(' ')}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={[
              'mx-auto w-full max-w-[calc(100vw-2rem)] shrink-0',
              maxWidthClass,
            ].join(' ')}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={headingId}
              className="rounded-[22px] border border-border bg-white p-5 sm:p-6 lg:p-8"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h3 id={headingId} className="text-[16px] font-semibold text-text-primary">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть"
                  className="shrink-0 text-text-tertiary transition-colors hover:text-text-secondary"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
