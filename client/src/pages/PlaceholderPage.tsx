import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <PageLayout>
      <PageBreadcrumbs items={[{ label: title }]} className="mb-4" />
      <h1 className="mb-2 text-2xl font-semibold text-text-primary">{title}</h1>
      <p className="text-sm text-text-secondary">Раздел в разработке</p>
    </PageLayout>
  )
}
