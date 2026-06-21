import type { Module } from '../../types/module'
import { pageSectionTitleLargeClass, pageSectionCountClass } from '../home/homeStyles'
import { ModuleCarousel } from '../ui/ModuleCarousel'

interface GlobalModuleSectionProps {
  title: string
  subtitle?: string
  modules: Module[]
  isLoading?: boolean
  className?: string
}

export function GlobalModuleSection({
  title,
  subtitle,
  modules,
  isLoading,
  className = 'mb-12',
}: GlobalModuleSectionProps) {
  return (
    <section className={className}>
      <div
        className={`flex items-baseline justify-between gap-3 ${subtitle ? 'mb-2' : 'mb-5'}`}
      >
        <h2 className={pageSectionTitleLargeClass}>{title}</h2>
        {!isLoading && modules.length > 0 && (
          <span className={pageSectionCountClass}>
            {modules.length}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mb-5 text-[14px] leading-relaxed text-text-secondary">{subtitle}</p>
      )}
      <ModuleCarousel modules={modules} isLoading={isLoading} />
    </section>
  )
}
