import { useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getCardColorTheme, resolveModuleBaseColor } from '../lib/cardColor'
import { ModuleModePicker } from '../components/module/ModuleModePicker'
import { ModuleStudyHeader } from '../components/module/ModuleStudyHeader'
import { AnagramGame } from '../components/module/study/AnagramGame'
import { FlashcardStudy } from '../components/module/study/FlashcardStudy'
import { GapTestStudy } from '../components/module/study/GapTestStudy'
import { MatchingStudy } from '../components/module/study/MatchingStudy'
import { MnemoGame } from '../components/module/study/MnemoGame'
import { TestStudy } from '../components/module/study/TestStudy'
import { TetrisGame } from '../components/module/study/TetrisGame'
import { homeCardClass } from '../components/home/homeStyles'
import { useGetModuleQuery } from '../store/api/modulesApi'
import { isStudyModeId, type StudyModeId } from '../types/studyMode'

export function ModulePage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const activeMode = isStudyModeId(modeParam) ? modeParam : null

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

  const { data, isLoading, isError } = useGetModuleQuery(id, { skip: !id })

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[800px] py-10 lg:py-14">
        <div className="mb-8 h-8 w-32 animate-pulse rounded-lg bg-surface-muted" />
        <div className="mb-4 h-10 w-2/3 animate-pulse rounded-lg bg-surface-muted" />
        <div className="mb-10 h-24 animate-pulse rounded-[20px] bg-surface-muted" />
        <div className="h-[320px] animate-pulse rounded-[20px] bg-surface-muted" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full max-w-[800px] py-10 lg:py-14">
        <div className={`px-6 py-12 text-center ${homeCardClass}`}>
          <p className="text-[15px] font-medium text-text-primary">Модуль не найден</p>
          <Link
            to="/library"
            className="mt-3 inline-block text-[13px] font-medium text-[#6366f1] hover:underline"
          >
            Вернуться в библиотеку
          </Link>
        </div>
      </div>
    )
  }

  const { module, flashcards } = data
  const accent = getCardColorTheme(resolveModuleBaseColor(module.id, module.color)).base

  if (flashcards.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[800px] py-10 lg:py-14">
        <ModuleStudyHeader module={module} />
        <div className={`px-6 py-12 text-center ${homeCardClass}`}>
          <p className="text-[15px] font-medium text-text-primary">В модуле пока нет карточек</p>
          <p className="mt-1 text-[13px] text-text-secondary">Добавьте термины, чтобы начать учить</p>
        </div>
      </div>
    )
  }

  const renderStudyMode = () => {
    switch (activeMode) {
      case 'cards':
        return <FlashcardStudy cards={flashcards} onBack={() => setActiveMode(null)} />
      case 'test':
        return <TestStudy cards={flashcards} onBack={() => setActiveMode(null)} />
      case 'gaps':
        return <GapTestStudy cards={flashcards} onBack={() => setActiveMode(null)} />
      case 'matching':
        return <MatchingStudy cards={flashcards} onBack={() => setActiveMode(null)} />
      case 'anagram':
        return <AnagramGame cards={flashcards} onBack={() => setActiveMode(null)} />
      case 'mnemo':
        return <MnemoGame cards={flashcards} onBack={() => setActiveMode(null)} />
      case 'tetris':
        return <TetrisGame cards={flashcards} onBack={() => setActiveMode(null)} />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto w-full max-w-[800px] py-10 lg:py-14">
      <ModuleStudyHeader
        module={module}
        activeMode={activeMode}
        onBackToModes={() => setActiveMode(null)}
      />
      {activeMode ? (
        renderStudyMode()
      ) : (
        <ModuleModePicker
          cardCount={flashcards.length}
          moduleAccent={accent}
          onSelect={setActiveMode}
        />
      )}
    </div>
  )
}
