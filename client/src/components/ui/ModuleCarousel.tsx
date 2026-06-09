import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetCurrentUserQuery } from '../../store/api/modulesApi'
import type { Module } from '../../types/module'
import { MODULE_CARD_HEIGHT, MODULE_CARD_WIDTH, ModuleCard } from './ModuleCard'

interface ModuleCarouselProps {
  modules?: Module[]
  isLoading?: boolean
}

const GAP = 20
const ARROW_SIZE = 32

const arrowClass = [
  'cursor-pointer rounded-full border border-border bg-white/95',
  'flex items-center justify-center text-text-secondary',
  'hover:text-text-primary hover:border-text-tertiary/40',
  'transition-opacity duration-150',
  'disabled:pointer-events-none',
].join(' ')

export function ModuleCarousel({ modules, isLoading }: ModuleCarouselProps) {
  const navigate = useNavigate()
  const { data: currentUser } = useGetCurrentUserQuery()
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scheduleScrollStateUpdate = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      updateScrollState()
    })
  }, [updateScrollState])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateScrollState()
    el.addEventListener('scroll', scheduleScrollStateUpdate, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      el.removeEventListener('scroll', scheduleScrollStateUpdate)
      window.removeEventListener('resize', updateScrollState)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [modules, isLoading, updateScrollState, scheduleScrollStateUpdate])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return

    const item = el.querySelector<HTMLElement>('[data-carousel-item]')
    const step = (item?.offsetWidth ?? MODULE_CARD_WIDTH) + GAP

    el.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scroll('left')
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      scroll('right')
    }
  }

  const arrowTop = (MODULE_CARD_HEIGHT - ARROW_SIZE) / 2

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-[22px] bg-surface-muted/80 animate-pulse"
            style={{ width: MODULE_CARD_WIDTH, height: MODULE_CARD_HEIGHT }}
          />
        ))}
      </div>
    )
  }

  if (!modules?.length) {
    return (
      <div
        className="flex items-center justify-center rounded-[22px] border border-dashed border-border"
        style={{ height: MODULE_CARD_HEIGHT }}
      >
        <p className="text-[14px] text-text-secondary text-center px-6">
          Пока нет недавних модулей
        </p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height: MODULE_CARD_HEIGHT }}>
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Недавние модули"
        onKeyDown={handleKeyDown}
        className={[
          'flex h-full overflow-x-auto overflow-y-hidden overscroll-x-contain overscroll-y-none',
          'snap-x snap-proximity scrollbar-hide',
          'focus:outline-none',
        ].join(' ')}
        style={{ gap: GAP, touchAction: 'pan-x' }}
      >
        {modules.map((module) => (
          <div
            key={module.id}
            data-carousel-item
            className="snap-start shrink-0 overflow-visible"
            style={{ width: MODULE_CARD_WIDTH, height: MODULE_CARD_HEIGHT }}
          >
            <ModuleCard
              module={module}
              currentUserId={currentUser?.id}
              onClick={() => navigate(`/module/${module.id}`)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        aria-label="Предыдущий модуль"
        aria-hidden={!canScrollLeft}
        className={arrowClass}
        style={{
          position: 'absolute',
          left: 10,
          top: arrowTop,
          width: ARROW_SIZE,
          height: ARROW_SIZE,
          opacity: canScrollLeft ? 1 : 0,
          zIndex: 20,
        }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        aria-label="Следующий модуль"
        aria-hidden={!canScrollRight}
        className={arrowClass}
        style={{
          position: 'absolute',
          right: 10,
          top: arrowTop,
          width: ARROW_SIZE,
          height: ARROW_SIZE,
          opacity: canScrollRight ? 1 : 0,
          zIndex: 20,
        }}
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
