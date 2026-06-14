import { useMemo, useState } from 'react'
import { buildGapWord, checkGapAnswer } from '../../../lib/gapWord'
import { pickSessionCards, TEST_SESSION_SIZE } from '../../../lib/testSession'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { moduleGhostButtonClass, modulePrimaryButtonClass } from '../moduleStyles'
import { StudyShell } from './StudyShell'
import { StudyTestResults, type TestAnswerReview } from './StudyTestResults'

interface GapTestStudyProps {
  cards: Flashcard[]
  accentColor?: string
}

const DIFFICULTY_OPTIONS = [
  { value: 25, label: 'Лёгкий' },
  { value: 50, label: 'Средний' },
  { value: 75, label: 'Сложный' },
]

interface GapQuestion {
  card: Flashcard
  display: string
  answer: string
}

function buildGapQuestions(cards: Flashcard[], difficulty: number): GapQuestion[] {
  return pickSessionCards(cards, TEST_SESSION_SIZE).map((card) => {
    const gap = buildGapWord(card.term, difficulty)
    return { card, display: gap.display, answer: gap.answer }
  })
}

export function GapTestStudy({ cards, accentColor }: GapTestStudyProps) {
  const [difficulty, setDifficulty] = useState(50)
  const [started, setStarted] = useState(false)
  const [session, setSession] = useState(0)
  const questions = useMemo(
    () => buildGapQuestions(cards, difficulty),
    [cards, difficulty, session],
  )
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [answers, setAnswers] = useState<TestAnswerReview[]>([])
  const [finished, setFinished] = useState(false)

  const answeredCount = questions.filter((q) => inputs[q.card.id]?.trim()).length
  const allAnswered = answeredCount === questions.length
  const progress = !started || questions.length === 0 ? 0 : (answeredCount / questions.length) * 100

  const handleInput = (cardId: string, value: string) => {
    setInputs((prev) => ({ ...prev, [cardId]: value }))
  }

  const handleSubmit = () => {
    if (!allAnswered) return

    const review: TestAnswerReview[] = questions.map((q) => ({
      cardId: q.card.id,
      prompt: q.card.definition,
      userAnswer: inputs[q.card.id].trim(),
      correctAnswer: q.answer,
      isCorrect: checkGapAnswer(inputs[q.card.id], q.answer),
    }))

    setAnswers(review)
    setFinished(true)
  }

  if (!started) {
    return (
      <StudyShell title="Пропуски" accentColor={accentColor}>
        <div className={`p-6 ${homeCardClass}`}>
          <p className="mb-4 text-[14px] text-text-secondary">
            На одной странице — {Math.min(TEST_SESSION_SIZE, cards.length)} заданий. Результат
            увидите после ответа на все.
          </p>
          <p className="mb-3 text-[13px] font-medium text-text-primary">Сложность</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(opt.value)}
                className={[
                  'cursor-pointer rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors',
                  difficulty === opt.value
                    ? 'border-text-tertiary bg-surface-subtle text-text-primary'
                    : 'border-border text-text-secondary hover:border-[#d4d9e0] hover:text-text-primary',
                ].join(' ')}
              >
                {opt.label} · {opt.value}%
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className={modulePrimaryButtonClass}
          >
            Начать · {Math.min(TEST_SESSION_SIZE, cards.length)} заданий
          </button>
          <p className="mt-6 border-t border-border pt-4 text-[12px] leading-relaxed text-text-tertiary">
            Этот режим подходит для изучения языков и запоминания правописания слов — не для
            терминов.
          </p>
        </div>
      </StudyShell>
    )
  }

  if (finished) {
    const difficultyLabel = DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.label

    return (
      <StudyShell title="Пропуски" accentColor={accentColor}>
        <StudyTestResults
          title="Упражнение завершено"
          answers={answers}
          accentColor={accentColor}
          detail={`Сложность: ${difficultyLabel ?? difficulty}% скрытых букв`}
          onRestart={() => {
            setSession((s) => s + 1)
            setStarted(false)
            setInputs({})
            setAnswers([])
            setFinished(false)
          }}
        />
      </StudyShell>
    )
  }

  if (questions.length === 0) return null

  return (
    <StudyShell
      title="Пропуски"
      subtitle={`${questions.length} заданий · ответьте на все, чтобы увидеть результат`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.card.id} className={`p-5 sm:p-6 ${homeCardClass}`}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              Задание {index + 1}
            </p>
            <p className="mb-4 text-[16px] leading-relaxed text-text-primary sm:text-[17px]">
              {question.card.definition}
            </p>

            <p className="mb-2 text-[12px] font-medium text-text-secondary">Слово с пропусками</p>
            <p className="mb-4 font-mono text-[22px] font-semibold tracking-wide text-text-primary sm:text-[24px]">
              {question.display}
            </p>

            <input
              type="text"
              value={inputs[question.card.id] ?? ''}
              onChange={(e) => handleInput(question.card.id, e.target.value)}
              placeholder="Введите полный термин"
              className="w-full rounded-xl border border-border bg-surface-subtle/50 px-4 py-3 text-[15px] outline-none transition-colors hover:border-text-tertiary/40 focus:border-text-tertiary focus:bg-white focus:outline-none"
            />
          </div>
        ))}

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
