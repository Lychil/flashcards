import { useMemo, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import type { SrsRating } from '../../../types/srs'
import type { Flashcard } from '../../../types/flashcard'
import { SrsRatingButtons } from '../SrsRatingButtons'
import { homeCardClass } from '../../home/homeStyles'
import { StudyResult, StudyShell } from './StudyShell'

interface TestStudyProps {
  cards: Flashcard[]
  accentColor?: string
  onRate?: (cardId: string, rating: SrsRating) => void
}

interface TestQuestion {
  card: Flashcard
  options: string[]
}

function buildQuestions(cards: Flashcard[]): TestQuestion[] {
  return shuffle(cards).map((card) => {
    const distractors = pickRandom(
      cards.filter((c) => c.id !== card.id).map((c) => c.term),
      3,
    )
    return {
      card,
      options: shuffle([card.term, ...distractors]),
    }
  })
}

export function TestStudy({ cards, accentColor, onRate }: TestStudyProps) {
  const [session, setSession] = useState(0)
  const questions = useMemo(() => buildQuestions(cards), [cards, session])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [awaitingRating, setAwaitingRating] = useState(false)

  const current = questions[index]
  const progress = ((index + (selected ? 1 : 0)) / questions.length) * 100

  const handleSelect = (option: string) => {
    if (selected) return
    setSelected(option)
    const isCorrect = option === current.card.term
    if (isCorrect) setCorrectCount((c) => c + 1)
    setAwaitingRating(true)
  }

  const handleRate = (rating: SrsRating) => {
    onRate?.(current.card.id, rating)
    setAwaitingRating(false)
    handleNext()
  }

  const handleNext = () => {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  const restart = () => {
    setSession((s) => s + 1)
    setIndex(0)
    setSelected(null)
    setCorrectCount(0)
    setFinished(false)
    setAwaitingRating(false)
  }

  if (finished) {
    return (
      <StudyShell title="Тестирование" accentColor={accentColor}>
        <StudyResult
          title="Тест завершён"
          scoreLabel={`${correctCount} / ${questions.length}`}
          detail={`${Math.round((correctCount / questions.length) * 100)}% правильных ответов`}
          onRestart={restart}
        />
      </StudyShell>
    )
  }

  const isCorrect = selected === current.card.term

  return (
    <StudyShell
      title="Тестирование"
      subtitle={`Вопрос ${index + 1} из ${questions.length}`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className={`p-6 ${homeCardClass}`}>
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Обратная сторона
        </p>
        <p className="mb-6 text-[18px] leading-relaxed text-text-primary">{current.card.definition}</p>

        <p className="mb-3 text-[13px] font-medium text-text-secondary">Выберите термин</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {current.options.map((option) => {
            let style = 'border-border bg-white hover:border-[#d4d9e0]'
            if (selected) {
              if (option === current.card.term) {
                style = 'border-[#6BC9A7] bg-[#6BC9A7]/10 text-[#2d8a66]'
              } else if (option === selected) {
                style = 'border-[#E879A9] bg-[#E879A9]/10 text-[#b04472]'
              } else {
                style = 'border-border bg-surface-subtle/60 opacity-60'
              }
            }

            return (
              <button
                key={option}
                type="button"
                disabled={Boolean(selected)}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer rounded-xl border px-4 py-3 text-left text-[14px] font-medium transition-colors disabled:cursor-default ${style}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {selected && awaitingRating && (
          <div className="mt-6 space-y-3">
            <p className={`text-[13px] font-medium ${isCorrect ? 'text-[#2d8a66]' : 'text-[#b04472]'}`}>
              {isCorrect ? 'Верно!' : `Правильный ответ: ${current.card.term}`}
            </p>
            <p className="text-[12px] font-medium text-text-secondary">
              Оцените, насколько легко вспомнили:
            </p>
            <SrsRatingButtons onRate={handleRate} />
          </div>
        )}
      </div>
    </StudyShell>
  )
}
