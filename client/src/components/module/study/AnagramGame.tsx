import { useEffect, useMemo, useState } from 'react'
import { isSpellingMatch } from '../../../lib/spellingDiff'
import { shuffle } from '../../../lib/shuffle'
import { pickSessionCards, TEST_SESSION_SIZE } from '../../../lib/testSession'
import type { SrsRating } from '../../../types/srs'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { moduleGhostButtonClass } from '../moduleStyles'
import { StudyShell } from './StudyShell'
import { StudyTestResults, type TestAnswerReview } from './StudyTestResults'

interface AnagramGameProps {
  cards: Flashcard[]
  accentColor?: string
  onRate?: (cardId: string, rating: SrsRating) => void
}

interface AnagramQuestion {
  card: Flashcard
  letterPool: string[]
}

interface QuestionState {
  picked: number[]
  available: number[]
}

function scrambleLetters(word: string): string[] {
  const letters = word.replace(/\s+/g, '').split('')
  let scrambled = shuffle(letters)
  let attempts = 0
  while (scrambled.join('') === letters.join('') && attempts < 10) {
    scrambled = shuffle(letters)
    attempts += 1
  }
  return scrambled
}

function buildQuestions(cards: Flashcard[]): AnagramQuestion[] {
  return pickSessionCards(cards, TEST_SESSION_SIZE).map((card) => ({
    card,
    letterPool: scrambleLetters(card.term),
  }))
}

function createInitialState(questions: AnagramQuestion[]): Record<string, QuestionState> {
  return Object.fromEntries(
    questions.map((question) => [
      question.card.id,
      {
        picked: [],
        available: question.letterPool.map((_, index) => index),
      },
    ]),
  )
}

function buildAnswerText(question: AnagramQuestion, state: QuestionState): string {
  return state.picked.map((index) => question.letterPool[index]).join('')
}

export function AnagramGame({ cards, accentColor, onRate }: AnagramGameProps) {
  const [session, setSession] = useState(0)
  const questions = useMemo(() => buildQuestions(cards), [cards, session])
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>(() =>
    createInitialState(questions),
  )
  const [results, setResults] = useState<TestAnswerReview[]>([])
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setQuestionStates(createInitialState(questions))
    setResults([])
    setFinished(false)
  }, [questions])

  const answeredCount = questions.filter((question) => {
    const state = questionStates[question.card.id]
    return state && state.picked.length === question.letterPool.length
  }).length

  const allAnswered = answeredCount === questions.length && questions.length > 0
  const progress = questions.length === 0 ? 0 : (answeredCount / questions.length) * 100

  const updateState = (cardId: string, updater: (state: QuestionState) => QuestionState) => {
    setQuestionStates((prev) => {
      const current = prev[cardId]
      if (!current) return prev
      return { ...prev, [cardId]: updater(current) }
    })
  }

  const pickLetter = (question: AnagramQuestion, letterIndex: number) => {
    updateState(question.card.id, (state) => ({
      picked: [...state.picked, letterIndex],
      available: state.available.filter((index) => index !== letterIndex),
    }))
  }

  const undoLetter = (question: AnagramQuestion) => {
    updateState(question.card.id, (state) => {
      if (state.picked.length === 0) return state
      const last = state.picked[state.picked.length - 1]
      return {
        picked: state.picked.slice(0, -1),
        available: [...state.available, last],
      }
    })
  }

  const applySrs = (review: TestAnswerReview[]) => {
    if (!onRate) return
    for (const answer of review) {
      if (answer.cardId) {
        onRate(answer.cardId, answer.isCorrect ? 'good' : 'hard')
      }
    }
  }

  const handleSubmit = () => {
    if (!allAnswered) return

    const review: TestAnswerReview[] = questions.map((question) => {
      const state = questionStates[question.card.id]
      const userAnswer = buildAnswerText(question, state)

      return {
        cardId: question.card.id,
        prompt: question.card.definition,
        userAnswer,
        correctAnswer: question.card.term,
        isCorrect: isSpellingMatch(userAnswer, question.card.term),
        reviewVariant: 'spelling',
      }
    })

    applySrs(review)
    setResults(review)
    setFinished(true)
  }

  const restart = () => {
    setSession((value) => value + 1)
  }

  if (finished) {
    return (
      <StudyShell title="Анаграмма" accentColor={accentColor}>
        <StudyTestResults
          title="Анаграмма завершена"
          answers={results}
          accentColor={accentColor}
          onRestart={restart}
        />
      </StudyShell>
    )
  }

  if (questions.length === 0) return null

  return (
    <StudyShell
      title="Анаграмма"
      subtitle={`${questions.length} заданий · соберите все слова, чтобы увидеть результат`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className="space-y-4">
        {questions.map((question, index) => {
          const state = questionStates[question.card.id]
          if (!state) return null

          const answer = buildAnswerText(question, state)
          const isComplete = state.picked.length === question.letterPool.length

          return (
            <div key={question.card.id} className={`p-5 sm:p-6 ${homeCardClass}`}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Задание {index + 1}
              </p>
              <p className="mb-4 text-[16px] leading-relaxed text-text-primary sm:text-[17px]">
                {question.card.definition}
              </p>

              <div className="mb-4 flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-surface-subtle/50 px-3 py-2">
                {state.picked.length === 0 ? (
                  <span className="text-[13px] text-text-tertiary">Соберите слово из букв</span>
                ) : (
                  state.picked.map((letterIndex, pickedIndex) => (
                    <span
                      key={`${letterIndex}-${pickedIndex}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-[16px] font-semibold uppercase"
                    >
                      {question.letterPool[letterIndex]}
                    </span>
                  ))
                )}
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {state.available.map((letterIndex) => (
                  <button
                    key={letterIndex}
                    type="button"
                    onClick={() => pickLetter(question, letterIndex)}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-[16px] font-semibold uppercase transition-colors hover:border-[#d4d9e0] hover:bg-surface-subtle/30"
                  >
                    {question.letterPool[letterIndex]}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => undoLetter(question)}
                  disabled={state.picked.length === 0}
                  className={`${moduleGhostButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Отменить
                </button>
                <span className="text-[12px] tabular-nums text-text-tertiary">
                  {answer.length}/{question.letterPool.length}
                </span>
              </div>

              {!isComplete && (
                <p className="mt-3 text-[12px] text-text-tertiary">Используйте все буквы</p>
              )}
            </div>
          )
        })}

        <div className={`sticky bottom-4 flex items-center justify-between gap-4 p-4 ${homeCardClass}`}>
          <p className="text-[13px] text-text-secondary">
            Собрано{' '}
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
