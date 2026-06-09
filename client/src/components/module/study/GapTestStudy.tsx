import { useMemo, useState } from 'react'
import { buildGapWord, checkGapAnswer } from '../../../lib/gapWord'
import { shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { StudyResult, StudyShell } from './StudyShell'

interface GapTestStudyProps {
  cards: Flashcard[]
  onBack: () => void
}

const DIFFICULTY_OPTIONS = [
  { value: 25, label: 'Лёгкий' },
  { value: 50, label: 'Средний' },
  { value: 75, label: 'Сложный' },
]

export function GapTestStudy({ cards, onBack }: GapTestStudyProps) {
  const [difficulty, setDifficulty] = useState(50)
  const [started, setStarted] = useState(false)
  const [session, setSession] = useState(0)
  const questions = useMemo(() => shuffle(cards), [cards, session])
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = questions[index]
  const gap = useMemo(
    () => (current ? buildGapWord(current.term, difficulty) : null),
    [current, difficulty],
  )

  const progress = started ? ((index + (checked !== null ? 1 : 0)) / questions.length) * 100 : 0

  const handleCheck = () => {
    if (!gap || checked !== null) return
    const ok = checkGapAnswer(input, gap.answer)
    setChecked(ok)
    if (ok) setCorrectCount((c) => c + 1)
  }

  const handleNext = () => {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setInput('')
    setChecked(null)
  }

  if (!started) {
    return (
      <StudyShell title="Пропуски в словах" onBack={onBack}>
        <div className={`p-6 ${homeCardClass}`}>
          <p className="mb-4 text-[14px] text-text-secondary">
            Восстановите термин по определению. Настройте, сколько букв будет скрыто.
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
                    ? 'border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]'
                    : 'border-border text-text-secondary hover:border-[#d4d9e0]',
                ].join(' ')}
              >
                {opt.label} · {opt.value}%
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="cursor-pointer rounded-xl bg-[#6366f1] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
          >
            Начать · {questions.length} слов
          </button>
        </div>
      </StudyShell>
    )
  }

  if (finished) {
    return (
      <StudyShell title="Пропуски в словах" onBack={onBack}>
        <StudyResult
          title="Упражнение завершено"
          scoreLabel={`${correctCount} / ${questions.length}`}
          detail={`Сложность: ${difficulty}% скрытых букв`}
          onRestart={() => {
            setSession((s) => s + 1)
            setStarted(false)
            setIndex(0)
            setInput('')
            setChecked(null)
            setCorrectCount(0)
            setFinished(false)
          }}
          onBack={onBack}
        />
      </StudyShell>
    )
  }

  if (!current || !gap) return null

  return (
    <StudyShell
      title="Пропуски в словах"
      subtitle={`${index + 1} из ${questions.length}`}
      progress={progress}
      onBack={onBack}
    >
      <div className={`p-6 ${homeCardClass}`}>
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Определение
        </p>
        <p className="mb-6 text-[18px] leading-relaxed text-text-primary">{current.definition}</p>

        <p className="mb-2 text-[13px] font-medium text-text-secondary">Термин с пропусками</p>
        <p className="mb-6 font-mono text-[24px] font-semibold tracking-wide text-text-primary">
          {gap.display}
        </p>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (checked === null ? handleCheck() : handleNext())}
          disabled={checked !== null}
          placeholder="Введите полный термин"
          className="mb-4 w-full rounded-xl border border-border bg-surface-subtle/50 px-4 py-3 text-[15px] outline-none focus:border-[#6366f1] disabled:opacity-60"
        />

        {checked === null ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={!input.trim()}
            className="cursor-pointer rounded-xl bg-[#6366f1] px-4 py-2.5 text-[13px] font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Проверить
          </button>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className={`text-[13px] font-medium ${checked ? 'text-[#2d8a66]' : 'text-[#b04472]'}`}>
              {checked ? 'Верно!' : `Правильный ответ: ${gap.answer}`}
            </p>
            <button
              type="button"
              onClick={handleNext}
              className="cursor-pointer rounded-xl bg-[#6366f1] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90"
            >
              {index >= questions.length - 1 ? 'Результат' : 'Далее'}
            </button>
          </div>
        )}
      </div>
    </StudyShell>
  )
}
