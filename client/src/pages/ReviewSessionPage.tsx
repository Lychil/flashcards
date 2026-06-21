import { ChevronLeft } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FlashcardStudy } from '../components/module/study/FlashcardStudy'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder } from '../components/ui/ContentPlaceholder'
import { useExamPlan } from '../hooks/useExamPlan'
import { useAllModulesCards } from '../hooks/useGlobalReviewQueue'
import { cardRepository } from '../services/cardRepository'
import { applySrsRating, createDefaultSrs, getPlanRequestRetention } from '../lib/spacedRepetition'
import { recordCardReview } from '../lib/moduleStudyActivity'
import { buildTodaySession } from '../lib/reviewQueue'
import { PLAN_PURPLE } from '../components/exam-plan/examPlanStyles'
import type { SrsRating } from '../types/srs'

export function ReviewSessionPage() {
  const { modules, cardsByModule } = useAllModulesCards()
  const { plan, schedule, syncStudyProgress } = useExamPlan(cardsByModule, modules)

  const activeModules = useMemo(
    () => modules.filter((m) => (cardsByModule[m.id]?.length ?? 0) > 0),
    [modules, cardsByModule],
  )

  const session = useMemo(
    () =>
      buildTodaySession(activeModules, cardsByModule, {
        plan,
        todayEntry: schedule?.todayEntry ?? null,
      }),
    [activeModules, cardsByModule, plan, schedule?.todayEntry],
  )

  const studyCards = useMemo(
    () => session.items.map((item) => item.card),
    [session.items],
  )

  const requestRetention = useMemo(() => getPlanRequestRetention(plan), [plan])

  const handleRate = useCallback(
    (cardId: string, rating: SrsRating) => {
      const item = session.items.find((i) => i.card.id === cardId)
      if (!item) return

      const updatedSrs = applySrsRating(
        item.card.srs ?? createDefaultSrs(),
        rating,
        Date.now(),
        requestRetention,
      )
      const updatedCard = { ...item.card, srs: updatedSrs }

      syncStudyProgress(item.moduleId, item.card)

      const moduleCards = cardsByModule[item.moduleId] ?? []
      const nextModuleCards = moduleCards.map((c) =>
        c.id === cardId ? updatedCard : c,
      )
      cardRepository.saveCards(item.moduleId, nextModuleCards)

      recordCardReview(item.moduleId)
    },
    [session.items, cardsByModule, syncStudyProgress, requestRetention],
  )

  const accentColor = session.items[0]?.moduleColor ?? PLAN_PURPLE

  if (session.totalDue === 0) {
    return (
      <PageLayout>
        <PageBreadcrumbs
          items={[{ label: 'Главная', to: '/' }, { label: 'Повторение' }]}
          className="mb-5"
        />
        <EmptyPlaceholder
          title="На сегодня всё повторено"
          description="Созревших карточек нет — хорошо выученные уже отложены алгоритмом на будущее."
          action={
            <Link
              to="/"
              className="inline-flex rounded-xl px-4 py-2 text-[13px] font-medium text-white"
              style={{ backgroundColor: PLAN_PURPLE }}
            >
              На главную
            </Link>
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[{ label: 'Главная', to: '/' }, { label: 'Повторение' }]}
        className="mb-5"
      />

      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        На главную
      </Link>

      <FlashcardStudy cards={studyCards} accentColor={accentColor} onRate={handleRate} />
    </PageLayout>
  )
}
