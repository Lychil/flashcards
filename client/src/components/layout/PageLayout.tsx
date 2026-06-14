import type { ReactNode } from 'react'

export type PageLayoutSize = 'default' | 'narrow' | 'wide'

const SIZE_CLASS: Record<PageLayoutSize, string> = {
  default: 'max-w-[1080px]',
  narrow: 'max-w-[640px]',
  wide: 'max-w-[1400px]',
}

export const pageLayoutClass = `w-full ${SIZE_CLASS.default} py-10 lg:py-14`

interface PageLayoutProps {
  children: ReactNode
  size?: PageLayoutSize
  className?: string
}

export function PageLayout({ children, size = 'default', className = '' }: PageLayoutProps) {
  return (
    <div className={['w-full py-10 lg:py-14', SIZE_CLASS[size], className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
