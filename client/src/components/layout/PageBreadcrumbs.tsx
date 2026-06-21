import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

interface BreadcrumbTrailItem {
  label: string
  to: string
}

interface CanonicalBreadcrumbItem extends BreadcrumbTrailItem {
  explicitPath: boolean
}

const BREADCRUMB_TRAIL_STORAGE_KEY = 'mnemo:breadcrumb-trail'
const MAX_BREADCRUMB_TRAIL_ITEMS = 6

function currentPath(pathname: string, search: string): string {
  return `${pathname}${search}`
}

function readBreadcrumbTrail(): BreadcrumbTrailItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.sessionStorage.getItem(BREADCRUMB_TRAIL_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is BreadcrumbTrailItem =>
        typeof item?.label === 'string' && typeof item?.to === 'string',
    )
  } catch {
    return []
  }
}

function writeBreadcrumbTrail(items: BreadcrumbTrailItem[]) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(BREADCRUMB_TRAIL_STORAGE_KEY, JSON.stringify(items))
}

function normalizeCanonicalItems(
  items: BreadcrumbItem[],
  activePath: string,
): CanonicalBreadcrumbItem[] {
  const normalized = items.map((item, index) => ({
    label: item.label,
    to: item.to ?? (index === items.length - 1 ? activePath : ''),
    explicitPath: Boolean(item.to),
  }))
    .filter((item) => item.to)

  if (activePath !== '/' && normalized[0]?.to !== '/') {
    return [{ label: 'Главная', to: '/', explicitPath: true }, ...normalized]
  }

  return normalized
}

function buildBreadcrumbTrail(
  storedTrail: BreadcrumbTrailItem[],
  canonicalItems: CanonicalBreadcrumbItem[],
  activePath: string,
): BreadcrumbTrailItem[] {
  const currentRouteItem = [...canonicalItems]
    .reverse()
    .find((item) => item.to === activePath && item.explicitPath) ??
    canonicalItems[canonicalItems.length - 1]

  if (!currentRouteItem) return []

  const existingIndex = storedTrail.findIndex((item) => item.to === activePath)
  const nextTrail =
    existingIndex >= 0
      ? [
          ...storedTrail.slice(0, existingIndex),
          { ...storedTrail[existingIndex], label: currentRouteItem.label },
        ]
      : storedTrail.length > 0
        ? [...storedTrail, currentRouteItem]
        : canonicalItems.slice(0, canonicalItems.findIndex((item) => item.to === activePath) + 1)

  const deduped = nextTrail.reduce<BreadcrumbTrailItem[]>((acc, item) => {
    const duplicateIndex = acc.findIndex((existing) => existing.to === item.to)
    if (duplicateIndex >= 0) return [...acc.slice(0, duplicateIndex), item]
    return [...acc, item]
  }, [])

  return deduped.slice(-MAX_BREADCRUMB_TRAIL_ITEMS)
}

export function PageBreadcrumbs({ items, className = '' }: PageBreadcrumbsProps) {
  const location = useLocation()
  const activePath = currentPath(location.pathname, location.search)

  const { breadcrumbItems, routeTrail } = useMemo(() => {
    const canonicalItems = normalizeCanonicalItems(items, activePath)
    const routeTrail = buildBreadcrumbTrail(readBreadcrumbTrail(), canonicalItems, activePath)
    const currentLabel = items[items.length - 1]?.label
    const routeLabel = routeTrail[routeTrail.length - 1]?.label
    const hasInPageStep = Boolean(currentLabel && routeLabel && currentLabel !== routeLabel)

    if (!hasInPageStep) {
      return {
        breadcrumbItems: routeTrail.length > 0 ? routeTrail : canonicalItems,
        routeTrail,
      }
    }

    return {
      breadcrumbItems: [
        ...routeTrail,
        { label: currentLabel, to: activePath },
      ],
      routeTrail,
    }
  }, [activePath, items])

  useEffect(() => {
    writeBreadcrumbTrail(routeTrail)
  }, [routeTrail])

  if (items.length === 0 || breadcrumbItems.length === 0) return null

  return (
    <nav
      aria-label="Навигация"
      className={['flex flex-wrap items-center gap-2 text-[13px]', className].filter(Boolean).join(' ')}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1

        return (
          <span key={`${item.to ?? item.label}-${index}`} className="inline-flex items-center gap-2">
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
