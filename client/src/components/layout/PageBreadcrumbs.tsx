import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function PageBreadcrumbs({ items, className = '' }: PageBreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Навигация"
      className={['flex flex-wrap items-center gap-2 text-[13px]', className].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 && <span className="text-text-tertiary">/</span>}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="font-medium text-text-secondary underline-offset-2 transition-colors hover:text-text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={[
                  isLast ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary',
                ].join(' ')}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
