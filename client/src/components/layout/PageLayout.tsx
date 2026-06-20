import type { ReactNode } from 'react'

export type PageLayoutSize = 'default' | 'narrow' | 'wide'

const sizeClass: Record<PageLayoutSize, string> = {
  default: '',
  narrow: 'max-w-[640px]',
  wide: '',
}

export const pageLayoutClass =
  'w-full px-6 lg:px-10 pt-6 pb-10 lg:pt-8 lg:pb-12'

interface PageLayoutProps {
  children: ReactNode
  size?: PageLayoutSize
  className?: string
}

export function PageLayout({ children, size = 'default', className = '' }: PageLayoutProps) {
  return (
    <div
      className={[pageLayoutClass, sizeClass[size], className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
