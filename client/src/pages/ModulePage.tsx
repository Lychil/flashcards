import { ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { filterCardsByTab } from '../lib/cardFilter'
import type { ImportMode, ParsedImportCard } from '../lib/moduleImportExport'
import { getModuleStudyStats } from '../lib/moduleStudyStats'
import { buildTodaySession } from '../lib/reviewQueue'
import { getCardColorTheme, resolveModuleBaseColor } from '../lib/cardColor'
import {
  loadModuleStudyActivity,
  recordCardReview,
} from '../lib/moduleStudyActivity'
import { recordStudyForPlan } from '../lib/planStudySync'
import { useModuleCards } from '../hooks/useModuleCards'
import { PageLayout } from '../components/layout/PageLayout'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { EmptyPlaceholder, LoadingPlaceholder } from '../components/ui/ContentPlaceholder'
import { ModuleCardList } from '../components/module/ModuleCardList'
import {
  getModuleBreadcrumbItems,
  ModulePageHeader,
} from '../components/module/ModulePageHeader'
import { ModuleImportExport } from '../components/module/ModuleImportExport'
import { StudyModeGrid } from '../components/module/StudyModeGrid'
import { StudyStats } from '../components/stats/StudyStats'
import { AnagramGame } from '../components/module/study/AnagramGame'
import { FlashcardStudy } from '../components/module/study/FlashcardStudy'
import { GapTestStudy } from '../components/module/study/GapTestStudy'
import { MatchingStudy } from '../components/module/study/MatchingStudy'
import { MnemoGame } from '../components/module/study/MnemoGame'
import { TestStudy } from '../components/module/study/TestStudy'
import { FallingBlocksGame } from '../components/module/study/FallingBlocksGame'
import { Toast } from '../components/ui/Toast'
import { useGetCurrentUserQuery, useGetModuleQuery } from '../store/api/modulesApi'
import type { CardFilter, Flashcard } from '../types/flashcard'
import type { ModuleStudyActivity } from '../types/srs'
import { isStudyModeId, type StudyModeId } from '../types/studyMode'

const EMPTY_CATEGORY_MESSAGE = 'В этой категории нет карточек для запуска'

export function ModulePage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const activeMode = isStudyModeId(modeParam) ? modeParam : null

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data, isLoading, isError } = useGetModuleQuery(id, { skip: !id })
  const {
    cards,
    rateCard: handleSrsRate,
    addCard: handleAddCard,
    updateCard: handleUpdateCard,
    deleteCards: handleDeleteCards,
    importCards,
  } = useModuleCards(id, data?.flashcards)
  const [cardFilter, setCardFilter] = useState<CardFilter>('all')
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [studyActivity, setStudyActivity] = useState<ModuleStudyActivity>({ reviewsByDate: {} })
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      setStudyActivity(loadModuleStudyActivity(id))
    }
  }, [id])

  const sessionCards = useMemo(
    () => filterCardsByTab(cards, cardFilter),
    [cards, cardFilter],
  )
  const moduleStudyStats = useMemo(() => getModuleStudyStats(cards), [cards])
  const categoryEmpty = sessionCards.length === 0 && cards.length > 0

  const setActiveMode = useCallback(
    (mode: StudyModeId | null) => {
      if (mode) {
        setSearchParams({ mode }, { replace: true })
      } else {
        setSearchParams({}, { replace: true })
      }
    },
    [setSearchParams],
  )

  const handleStudySelect = useCallback(
    (mode: StudyModeId) => {
      if (sessionCards.length === 0 && mode !== 'cards') {
        setToastMessage(EMPTY_CATEGORY_MESSAGE)
        return
      }

      if (mode === 'cards' && data?.module) {
        const mod = data.module
        const session = buildTodaySession([mod], { [mod.id]: sessionCards })
        if (session.totalDue === 0) {
          setToastMessage('На сегодня созревших карточек нет — всё повторено')
          return
        }
        setStudyCards(session.items.map((item) => item.card))
      } else {
        if (sessionCards.length === 0) {
          setToastMessage(EMPTY_CATEGORY_MESSAGE)
          return
        }
        setStudyCards(sessionCards)
      }

      setActiveMode(mode)
    },
    [sessionCards, setActiveMode, data?.module],
  )

  const handleSrsRateWithActivity = useCallback(
    (cardId: string, rating: import('../types/srs').SrsRating) => {
      const card = cards.find((c) => c.id === cardId)
      if (card && id) {
        recordStudyForPlan({ moduleId: id, card })
      }
      handleSrsRate(cardId, rating)
      if (id) {
        setStudyActivity(recordCardReview(id))
      }
    },
    [handleSrsRate, id, cards],
  )

  const handleImportCards = useCallback(
    (imported: ParsedImportCard[], mode: ImportMode) => {
      const count = importCards(imported, mode)
      setToastMessage(
        mode === 'replace'
          ? `Импортировано ${count} карточек (замена)`
          : `Добавлено ${count} карточек`,
      )
    },
    [importCards],
  )

  if (isLoading) {
    return (
      <PageLayout size="wide">
        <PageBreadcrumbs
          items={[{ label: 'Библиотека', to: '/library' }, { label: 'Модуль' }]}
          className="mb-5"
        />
        <LoadingPlaceholder variant="module-page" />
      </PageLayout>
    )
  }

  if (isError || !data) {
    return (
      <PageLayout>
        <PageBreadcrumbs
          items={[{ label: 'Библиотека', to: '/library' }, { label: 'Модуль' }]}
          className="mb-4"
        />
        <EmptyPlaceholder
          variant="inline"
          title="Модуль не найден"
          action={
            <Link
              to="/library"
              className="text-[14px] font-semibold text-[#6366f1] hover:underline"
            >
              Вернуться в библиотеку
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const { module } = data
  const moduleAccent = getCardColorTheme(resolveModuleBaseColor(module.id, module.color)).base
  const breadcrumbItems = getModuleBreadcrumbItems(module, activeMode)
  const activeStudyCards = studyCards.length > 0 ? studyCards : sessionCards

  const renderStudyMode = () => {
    if (activeStudyCards.length === 0) return null

    switch (activeMode) {
      case 'cards':
        return (
          <FlashcardStudy
            cards={activeStudyCards}
            accentColor={moduleAccent}
            onRate={handleSrsRateWithActivity}
          />
        )
      case 'test':
        return (
          <TestStudy
            cards={activeStudyCards}
            accentColor={moduleAccent}
            onRate={handleSrsRateWithActivity}
          />
        )
      case 'gaps':
        return <GapTestStudy cards={activeStudyCards} accentColor={moduleAccent} />
      case 'matching':
        return <MatchingStudy cards={activeStudyCards} accentColor={moduleAccent} />
      case 'anagram':
        return (
          <AnagramGame
            cards={activeStudyCards}
            accentColor={moduleAccent}
            onRate={handleSrsRateWithActivity}
          />
        )
      case 'mnemo':
        return <MnemoGame cards={activeStudyCards} accentColor={moduleAccent} />
      case 'blocks':
        return <FallingBlocksGame cards={activeStudyCards} accentColor={moduleAccent} />
      default:
        return null
    }
  }

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs items={breadcrumbItems} className="mb-5" />

      {activeMode ? (
        <>
          <button
            type="button"
            onClick={() => setActiveMode(null)}
            className="mb-6 inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-[#d4d9e0] hover:text-text-primary"
          >
            <ChevronLeft size={16} strokeWidth={2} />
            Назад к модулю
          </button>
          {renderStudyMode()}
        </>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[70fr_30fr] xl:gap-12">
          <div className="flex min-w-0 flex-col gap-8">
            <ModulePageHeader
              module={module}
              currentUserId={currentUser?.id}
              hideBreadcrumbs
              variant="compact"
              headerActions={
                <ModuleImportExport
                  moduleTitle={module.title}
                  cards={cards}
                  onImport={handleImportCards}
                />
              }
            />

            <StudyModeGrid
              sessionCardCount={sessionCards.length}
              categoryEmpty={categoryEmpty}
              isPremiumUser={currentUser?.isPremium}
              onSelect={handleStudySelect}
              onEmptyCategory={() => setToastMessage(EMPTY_CATEGORY_MESSAGE)}
              variant="hub"
            />

            <ModuleCardList
              cards={cards}
              accentColor={moduleAccent}
              filter={cardFilter}
              onFilterChange={setCardFilter}
              onAdd={handleAddCard}
              onUpdate={handleUpdateCard}
              onDelete={handleDeleteCards}
            />
          </div>

          {cards.length > 0 && (
            <aside className="min-w-0 border-t border-border pt-8 xl:sticky xl:top-0 xl:max-h-[calc(100dvh-3.5rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:border-t-0 xl:pt-0">
              <StudyStats
                layout="compact"
                reviewsByDate={studyActivity.reviewsByDate}
                progressPercent={moduleStudyStats.progressPercent}
                progressCaption="в этом модуле"
                accentColor={moduleAccent}
              />
            </aside>
          )}
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </PageLayout>
  )
}
