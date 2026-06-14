import type { ReactNode } from 'react'
import { PageBreadcrumbs } from '../layout/PageBreadcrumbs'
import { PageLayout } from '../layout/PageLayout'

interface CreatePageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function CreatePageShell({
  eyebrow,
  title,
  description,
  children,
}: CreatePageShellProps) {
  return (
    <PageLayout size="narrow">
      <PageBreadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: eyebrow },
        ]}
        className="mb-8"
      />

      <header className="mb-8">
        <h1 className="mb-2 text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary">
          {title}
        </h1>
        <p className="text-[14px] leading-relaxed text-text-secondary">{description}</p>
      </header>

      {children}
    </PageLayout>
  )
}
