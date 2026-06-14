import { useMemo, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import { pickSessionCards, TEST_SESSION_SIZE } from '../../../lib/testSession'
import type { SrsRating } from '../../../types/srs'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { moduleGhostButtonClass } from '../moduleStyles'
import { StudyShell } from './StudyShell'
import { StudyTestResults, type TestAnswerReview } from './StudyTestResults'

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
  const sessionCards = pickSessionCards(cards, TEST_SESSION_SIZE)

  return sessionCards.map((card) => {
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
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<TestAnswerReview[]>([])
  const [finished, setFinished] = useState(false)

  const answeredCount = questions.filter((q) => selections[q.card.id]).length
  const allAnswered = answeredCount === questions.length
  const progress = questions.length === 0 ? 0 : (answeredCount / questions.length) * 100

  const applySrs = (review: TestAnswerReview[]) => {
    if (!onRate) return
    for (const answer of review) {
      if (answer.cardId) {
        onRate(answer.cardId, answer.isCorrect ? 'good' : 'hard')
      }
    }
  }

  const handleSelect = (cardId: string, option: string) => {
    setSelections((prev) => ({ ...prev, [cardId]: option }))
  }

  const handleSubmit = () => {
    if (!allAnswered) return

    const review: TestAnswerReview[] = questions.map((q) => ({
      cardId: q.card.id,
      prompt: q.card.definition,
      userAnswer: selections[q.card.id],
      correctAnswer: q.card.term,
      isCorrect: selections[q.card.id] === q.card.term,
    }))

    applySrs(review)
    setAnswers(review)
    setFinished(true)
  }

  const restart = () => {
    setSession((s) => s + 1)
    setSelections({})
    setAnswers([])
    setFinished(false)
  }

  if (finished) {
    return (
      <StudyShell title="Тестирование" accentColor={accentColor}>
        <StudyTestResults
          title="Тест завершён"
          answers={answers}
          accentColor={accentColor}
          onRestart={restart}
        />
      </StudyShell>
    )
  }

  if (questions.length === 0) return null

  return (
    <StudyShell
      title="Тестирование"
      subtitle={`${questions.length} заданий · ответьте на все, чтобы увидеть результат`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className="space-y-4">
        {questions.map((question, index) => {
          const selected = selections[question.card.id]

          return (
            <div key={question.card.id} className={`p-5 sm:p-6 ${homeCardClass}`}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Задание {index + 1}
              </p>
              <p className="mb-4 text-[16px] leading-relaxed text-text-primary sm:text-[17px]">
                {question.card.definition}
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const isChosen = selected === option
                  const style = isChosen
                    ? 'border-text-tertiary bg-surface-subtle text-text-primary'
                    : 'border-border bg-white hover:border-[#d4d9e0] hover:bg-surface-subtle/30'

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(question.card.id, option)}
                      className={`cursor-pointer rounded-xl border px-4 py-2.5 text-left text-[14px] font-medium transition-colors ${style}`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div className={`sticky bottom-4 flex items-center justify-between gap-4 p-4 ${homeCardClass}`}>
          <p className="text-[13px] text-text-secondary">
            Отвечено{' '}
            <span className="font-semibold tabular-nums text-text-primary">
              {answeredCount} / {questions.length}
            </span>
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`${moduleGhostButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Показать результат
          </button>
        </div>
      </div>
    </StudyShell>
  )
}
