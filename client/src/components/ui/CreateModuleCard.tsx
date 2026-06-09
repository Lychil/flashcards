import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'

interface CreateModuleCardProps {
  title: string
  description: string
  icon: LucideIcon
  featured?: boolean
  onClick?: () => void
}

export function CreateModuleCard({
  title,
  description,
  icon: Icon,
  featured = false,
  onClick,
}: CreateModuleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative w-full text-left p-8 rounded-xl bg-surface',
        'border transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        featured
          ? 'border-text-primary/15 shadow-card hover:shadow-card-hover hover:border-text-primary/25'
          : 'border-border hover:border-text-tertiary/40 hover:shadow-soft',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div
            className={[
              'inline-flex items-center justify-center w-10 h-10 rounded-[10px] mb-5',
              featured
                ? 'bg-text-primary text-surface'
                : 'bg-surface-muted text-text-secondary',
            ].join(' ')}
          >
            <Icon size={18} strokeWidth={1.5} />
          </div>
          <h3 className="text-[15px] font-semibold text-text-primary mb-2 tracking-[-0.01em]">
            {title}
          </h3>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-[280px]">
            {description}
          </p>
        </div>
        <ArrowUpRight
          size={16}
          strokeWidth={1.5}
          className="shrink-0 mt-1 text-text-tertiary opacity-0 -translate-x-1 translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
        />
      </div>
      {featured && (
        <span className="absolute top-6 right-6 text-[10px] font-medium uppercase tracking-[0.06em] text-accent">
          Фишка сервиса
        </span>
      )}
    </button>
  )
}
