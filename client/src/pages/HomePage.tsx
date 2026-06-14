import { Link } from 'react-router-dom'
import { DiagramsPreview } from '../components/home/DiagramsPreview'
import {
  homeCardClass,
  moduleTextButtonClass,
  pageSectionTitleClass,
  pageSectionTitleLargeClass,
  statsLabelClass,
} from '../components/home/homeStyles'
import { HomeStats } from '../components/home/HomeStats'
import { ReviewQueue } from '../components/home/ReviewQueue'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { CreateDropdown } from '../components/ui/CreateDropdown'
import { ModuleCarousel } from '../components/ui/ModuleCarousel'
import { ModuleSearch } from '../components/ui/ModuleSearch'
import { useGetCurrentUserQuery, useGetRecentModulesQuery } from '../store/api/modulesApi'
import type { Module } from '../types/module'

function pickReviewQueue(modules: Module[]): Module[] {
  return [...modules]
    .sort((a, b) => new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime())
    .slice(0, 4)
}

function calcHomeStats(modules: Module[]) {
  const cardsDue = modules.reduce(
    (sum, m) => sum + Math.max(1, Math.round((m.wordCount * (100 - m.progress)) / 100)),
    0,
  )
  const averageProgress =
    modules.length === 0
      ? 0
      : Math.round(modules.reduce((sum, m) => sum + m.progress, 0) / modules.length)

  return { cardsDue, streakDays: 5, averageProgress }
}

export function HomePage() {
  const { data: user } = useGetCurrentUserQuery()
  const { data: modules, isLoading } = useGetRecentModulesQuery()

  const reviewQueue = modules ? pickReviewQueue(modules) : []
  const stats = modules ? calcHomeStats(modules) : { cardsDue: 0, streakDays: 0, averageProgress: 0 }

  return (
    <PageLayout>
      <header className="mb-8">
        <PageBreadcrumbs items={[{ label: 'Главная' }]} className="mb-5" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="mb-2 text-[26px] font-bold leading-tight tracking-[-0.03em] text-text-primary sm:text-[32px]">
              Привет, {user?.name ?? '...'}
            </h1>
            <p className="text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
              Что будете изучать сегодня?
            </p>
          </div>
          <CreateDropdown />
        </div>
        <ModuleSearch />
      </header>

      {!isLoading && modules && modules.length > 0 && (
        <section className="mb-8">
          <HomeStats
            cardsDue={stats.cardsDue}
            streakDays={stats.streakDays}
            averageProgress={stats.averageProgress}
          />
        </section>
      )}

      <section className="mb-8">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className={pageSectionTitleLargeClass}>Недавние модули</h2>
          {modules && modules.length > 0 && (
            <span className={`${statsLabelClass} normal-case tracking-normal`}>
              {modules.length}
            </span>
          )}
        </div>
        <ModuleCarousel modules={modules} isLoading={isLoading} />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className={pageSectionTitleClass}>Очередь повторений</h2>
            <span className={statsLabelClass}>по давности</span>
          </div>
          {!isLoading && reviewQueue.length > 0 ? (
            <ReviewQueue modules={reviewQueue} />
          ) : (
            <div className={`px-4 py-6 text-center ${homeCardClass}`}>
              <p className="text-[13px] text-text-secondary">Нет модулей для повторения</p>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className={pageSectionTitleClass}>Диаграммы</h2>
            <Link to="/diagrams" className={moduleTextButtonClass}>
              Все
            </Link>
          </div>
          <DiagramsPreview />
        </section>
      </div>
    </PageLayout>
  )
}
