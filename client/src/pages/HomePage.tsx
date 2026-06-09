import { DiagramsPreview } from '../components/home/DiagramsPreview'
import { homeCardClass } from '../components/home/homeStyles'
import { HomeStats } from '../components/home/HomeStats'
import { ReviewQueue } from '../components/home/ReviewQueue'
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
    <div className="w-full max-w-[1080px] py-10 lg:py-14">
      <header className="mb-10">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary mb-4">
          Главная
        </p>
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="min-w-0">
            <h1 className="text-[30px] lg:text-[34px] font-semibold text-text-primary tracking-[-0.03em] leading-[1.12] mb-2">
              Привет, {user?.name ?? '...'}
            </h1>
            <p className="text-[15px] text-text-secondary leading-relaxed">
              Что будете изучать сегодня?
            </p>
          </div>
          <CreateDropdown />
        </div>
        <ModuleSearch />
      </header>

      {!isLoading && modules && modules.length > 0 && (
        <section className="mb-12">
          <HomeStats
            cardsDue={stats.cardsDue}
            streakDays={stats.streakDays}
            averageProgress={stats.averageProgress}
          />
        </section>
      )}

      <section className="mb-12">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-text-primary">
            Недавние модули
          </h2>
          {modules && modules.length > 0 && (
            <span className="text-[12px] text-text-tertiary tabular-nums">
              {modules.length}
            </span>
          )}
        </div>
        <ModuleCarousel modules={modules} isLoading={isLoading} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-text-primary">
              Очередь повторений
            </h2>
            <span className="text-[12px] text-text-tertiary">по давности</span>
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
          <DiagramsPreview />
        </section>
      </div>
    </div>
  )
}
