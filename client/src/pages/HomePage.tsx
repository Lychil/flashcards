import { useMemo } from 'react'
import { GlobalModuleSection } from '../components/global/GlobalModuleSection'
import { TodayReviewHero } from '../components/home/TodayReviewHero'
import { pageSectionTitleLargeClass, pageSectionCountClass } from '../components/home/homeStyles'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { ModuleCarousel } from '../components/ui/ModuleCarousel'
import { useAllModulesCards } from '../hooks/useGlobalReviewQueue'
import { useExamPlan } from '../hooks/useExamPlan'
import { buildGlobalModuleCollections } from '../lib/globalModules'
import { buildTodaySession } from '../lib/reviewQueue'
import {
  useGetCurrentUserQuery,
  useGetGlobalModulesQuery,
  useGetRecentModulesQuery,
} from '../store/api/modulesApi'

export function HomePage() {
  const { data: user } = useGetCurrentUserQuery()
  const { data: recentModules, isLoading: recentLoading } = useGetRecentModulesQuery()
  const { data: globalData, isLoading: popularLoading } = useGetGlobalModulesQuery()
  const { modules, cardsByModule } = useAllModulesCards()
  const { plan, schedule } = useExamPlan(cardsByModule, modules)

  const popularModules = useMemo(() => {
    if (!globalData) return []
    const collections = buildGlobalModuleCollections(
      globalData.modules,
      globalData.currentUserId,
      8,
    )
    return collections.find((c) => c.id === 'popular')?.modules ?? []
  }, [globalData])

  const activeModules = modules.filter((m) => (cardsByModule[m.id]?.length ?? 0) > 0)
  const session = buildTodaySession(activeModules, cardsByModule, {
    plan,
    todayEntry: schedule?.todayEntry ?? null,
  })

  return (
    <PageLayout>
      <header className="mb-8">
        <PageBreadcrumbs items={[{ label: 'Главная' }]} className="mb-5" />
        <div className="min-w-0">
          <h1 className="mb-2 text-[26px] font-bold leading-tight tracking-[-0.03em] text-text-primary sm:text-[32px]">
            Привет, {user?.name ?? '...'}
          </h1>
          <p className="text-[14px] leading-relaxed text-text-secondary sm:text-[15px]">
            {session.totalDue > 0
              ? 'Сегодня созрело карточек к повторению — начните сессию'
              : 'На сегодня всё повторено — отличная работа!'}
          </p>
        </div>
      </header>

      <section className="mb-8">
        <div className="mb-5">
          <h2 className={pageSectionTitleLargeClass}>К повторению сегодня</h2>
        </div>
        <TodayReviewHero
          totalDue={session.totalDue}
          reviewCount={session.reviewCount}
          newCount={session.newCount}
          fromPlan={Boolean(plan)}
          goalTitle={plan?.goalTitle}
        />
      </section>

      <section className="mb-8">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <h2 className={pageSectionTitleLargeClass}>Недавние модули</h2>
          {recentModules && recentModules.length > 0 && (
            <span className={pageSectionCountClass}>
              {recentModules.length}
            </span>
          )}
        </div>
        <ModuleCarousel modules={recentModules} isLoading={recentLoading} />
      </section>

      {(popularLoading || popularModules.length > 0) && (
        <GlobalModuleSection
          className="mb-8"
          title="Популярное"
          modules={popularModules}
          isLoading={popularLoading}
        />
      )}
    </PageLayout>
  )
}
