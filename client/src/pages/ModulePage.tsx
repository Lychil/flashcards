import { ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { filterCardsByTab } from '../lib/cardFilter'
import type { ImportMode, ParsedImportCard } from '../lib/moduleImportExport'
import { enrichFlashcards } from '../lib/enrichFlashcards'
import { getModuleStudyStats } from '../lib/moduleStudyStats'
import { getCardColorTheme, resolveModuleBaseColor } from '../lib/cardColor'
import {
  loadModuleStudyActivity,
  recordCardReview,
} from '../lib/moduleStudyActivity'
import { applySrsRating, createDefaultSrs } from '../lib/spacedRepetition'
import { PageLayout } from '../components/layout/PageLayout'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
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
import type { ModuleStudyActivity, SrsRating } from '../types/srs'
import { isStudyModeId, type StudyModeId } from '../types/studyMode'

const EMPTY_CATEGORY_MESSAGE = 'В этой категории нет карточек для запуска'

export function ModulePage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const activeMode = isStudyModeId(modeParam) ? modeParam : null

  const { data: currentUser } = useGetCurrentUserQuery()
  const { data, isLoading, isError } = useGetModuleQuery(id, { skip: !id })
  const [cards, setCards] = useState<Flashcard[]>([])
  const [cardFilter, setCardFilter] = useState<CardFilter>('all')
  const [studyCards, setStudyCards] = useState<Flashcard[]>([])
  const [studyActivity, setStudyActivity] = useState<ModuleStudyActivity>({ reviewsByDate: {} })
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      setStudyActivity(loadModuleStudyActivity(id))
    }
  }, [id])

  useEffect(() => {
    if (data?.flashcards) {
      setCards(enrichFlashcards(data.flashcards))
    }
  }, [data])

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
      if (sessionCards.length === 0) {
        setToastMessage(EMPTY_CATEGORY_MESSAGE)
        return
      }
      setStudyCards(sessionCards)
      setActiveMode(mode)
    },
    [sessionCards, setActiveMode],
  )

  const handleSrsRate = useCallback(
    (cardId: string, rating: SrsRating) => {
      setCards((prev) =>
        prev.map((card) => {
          if (card.id !== cardId) return card
          const srs = applySrsRating(card.srs ?? createDefaultSrs(), rating)
          return { ...card, srs }
        }),
      )
      if (id) {
        setStudyActivity(recordCardReview(id))
      }
    },
    [id],
  )

  const handleAddCard = (card: Omit<Flashcard, 'id'>) => {
    setCards((prev) => [
      ...prev,
      { ...card, id: `local-${Date.now()}`, srs: card.srs ?? createDefaultSrs() },
    ])
  }

  const handleUpdateCard = (cardId: string, patch: Partial<Omit<Flashcard, 'id'>>) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...patch } : c)))
  }

  const handleDeleteCards = (ids: string[]) => {
    const idSet = new Set(ids)
    setCards((prev) => prev.filter((c) => !idSet.has(c.id)))
  }

  const handleImportCards = useCallback((imported: ParsedImportCard[], mode: ImportMode) => {
    const nextCards = imported.map((card, index) => ({
      ...card,
      id: `import-${Date.now()}-${index}`,
      srs: createDefaultSrs(),
    }))

    setCards((prev) => (mode === 'replace' ? nextCards : [...prev, ...nextCards]))
    setToastMessage(
      mode === 'replace'
        ? `Импортировано ${nextCards.length} карточек (замена)`
        : `Добавлено ${nextCards.length} карточек`,
    )
  }, [])

  if (isLoading) {
    return (
      <PageLayout size="wide" className="max-w-none">
        <PageBreadcrumbs
          items={[{ label: 'Библиотека', to: '/library' }, { label: 'Модуль' }]}
          className="mb-5"
        />
        <div className="mb-8 h-36 animate-pulse rounded-2xl bg-surface-muted" />
        <div className="grid gap-8 xl:grid-cols-[70fr_30fr]">
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" />
            <div className="h-96 animate-pulse rounded-2xl bg-surface-muted" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />
        </div>
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
        <p className="text-[16px] font-bold text-text-primary">Модуль не найден</p>
        <Link
          to="/library"
          className="mt-3 inline-block text-[14px] font-semibold text-[#6366f1] hover:underline"
        >
          Вернуться в библиотеку
        </Link>
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
            onRate={handleSrsRate}
          />
        )
      case 'test':
        return (
          <TestStudy
            cards={activeStudyCards}
            accentColor={moduleAccent}
            onRate={handleSrsRate}
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
            onRate={handleSrsRate}
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
    <PageLayout size="wide" className="max-w-none">
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
              onRate={handleSrsRate}
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
