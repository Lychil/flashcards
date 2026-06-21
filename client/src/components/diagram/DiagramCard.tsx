import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { MockDiagram } from '../../lib/mockDiagrams'

export function DiagramImagePreview({ diagram, compact = false }: { diagram: MockDiagram; compact?: boolean }) {
  const markers = compact ? diagram.markers.slice(0, 4) : diagram.markers

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[22px] bg-surface-subtle',
        compact ? 'h-36' : 'aspect-[4/3]',
      ].join(' ')}
    >
      <img
        src={diagram.imageDataUrl}
        alt=""
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-transparent" />

      {markers.map((marker, index) => (
        <span
          key={marker.id}
          className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[10px] font-bold"
          style={{
            left: `${marker.x * 100}%`,
            top: `${marker.y * 100}%`,
            color: diagram.accent,
          }}
        >
          {index + 1}
        </span>
      ))}
    </div>
  )
}

export function DiagramCard({ diagram }: { diagram: MockDiagram }) {
  return (
    <Link
      to={`/diagrams/${diagram.id}`}
      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-[24px] bg-white p-3 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <DiagramImagePreview diagram={diagram} />

      <div className="flex min-w-0 flex-1 flex-col px-1 pb-1 pt-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span
            className="truncate rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: diagram.accentSoft, color: diagram.accent }}
          >
            {diagram.subject}
          </span>
          <span className="shrink-0 text-[11px] text-text-tertiary">
            {diagram.markers.length} меток
          </span>
        </div>

        <h2 className="line-clamp-1 text-[16px] font-semibold leading-tight tracking-[-0.02em] text-text-primary">
          {diagram.title}
        </h2>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
          {diagram.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[12px] text-text-tertiary">{diagram.updatedAt}</span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold text-white transition-opacity group-hover:opacity-90"
            style={{ backgroundColor: diagram.accent }}
          >
            Открыть
            <ArrowRight size={13} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  )
}
