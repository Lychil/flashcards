import { useEffect, useMemo, useState } from 'react'
import { shuffle } from '../../../lib/shuffle'
import type { SrsRating } from '../../../types/srs'
import type { Flashcard } from '../../../types/flashcard'
import { SrsRatingButtons } from '../SrsRatingButtons'
import { homeCardClass } from '../../home/homeStyles'
import { StudyResult, StudyShell } from './StudyShell'

interface AnagramGameProps {
  cards: Flashcard[]
  accentColor?: string
  onRate?: (cardId: string, rating: SrsRating) => void
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

export function AnagramGame({ cards, accentColor, onRate }: AnagramGameProps) {
  const [questions] = useState(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const [available, setAvailable] = useState<number[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = questions[index]

  const letterPool = useMemo(() => {
    if (!current) return []
    return scrambleLetters(current.term)
  }, [current])

  useEffect(() => {
    setAvailable(letterPool.map((_, i) => i))
    setPicked([])
    setFeedback(null)
  }, [letterPool, index])

  const progress = ((index + (feedback ? 1 : 0)) / questions.length) * 100
  const answer = picked.map((i) => letterPool[i]).join('')

  const pickLetter = (letterIndex: number) => {
    if (feedback) return
    setPicked((p) => [...p, letterIndex])
    setAvailable((a) => a.filter((i) => i !== letterIndex))
  }

  const undoLetter = () => {
    if (feedback || picked.length === 0) return
    const last = picked[picked.length - 1]
    setPicked((p) => p.slice(0, -1))
    setAvailable((a) => [...a, last])
  }

  const check = () => {
    if (!current || feedback) return
    const normalizedAnswer = answer.replace(/\s/g, '').toLowerCase()
    const normalizedTerm = current.term.replace(/\s/g, '').toLowerCase()
    const ok = normalizedAnswer === normalizedTerm
    setFeedback(ok ? 'correct' : 'wrong')
    if (ok) setCorrectCount((c) => c + 1)
  }

  const next = () => {
    if (index >= questions.length - 1) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
  }

  if (finished) {
    return (
      <StudyShell title="Анаграмма" accentColor={accentColor}>
        <StudyResult
          title="Игра завершена"
          scoreLabel={`${correctCount} / ${questions.length}`}
          onRestart={() => {
            setIndex(0)
            setPicked([])
            setFeedback(null)
            setCorrectCount(0)
            setFinished(false)
          }}
        />
      </StudyShell>
    )
  }

  if (!current) return null

  return (
    <StudyShell
      title="Анаграмма"
      subtitle={`${index + 1} из ${questions.length}`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className={`p-6 ${homeCardClass}`}>
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Обратная сторона
        </p>
        <p className="mb-6 text-[18px] leading-relaxed text-text-primary">{current.definition}</p>

        <div className="mb-4 flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-surface-subtle/50 px-3 py-2">
          {picked.length === 0 ? (
            <span className="text-[13px] text-text-tertiary">Соберите слово из букв</span>
          ) : (
            picked.map((li, i) => (
              <span
                key={`${li}-${i}`}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[16px] font-semibold shadow-sm"
              >
                {letterPool[li]}
              </span>
            ))
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {available.map((li) => (
            <button
              key={li}
              type="button"
              onClick={() => pickLetter(li)}
              disabled={Boolean(feedback)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-[16px] font-semibold transition-colors hover:border-[#6366f1] hover:bg-[#6366f1]/5 disabled:opacity-50"
            >
              {letterPool[li]}
            </button>
          ))}
        </div>

        {!feedback ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={undoLetter}
              disabled={picked.length === 0}
              className="cursor-pointer rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:border-[#d4d9e0] disabled:opacity-40"
            >
              Отменить
            </button>
            <button
              type="button"
              onClick={check}
              disabled={picked.length !== letterPool.length}
              className="cursor-pointer rounded-xl bg-[#6366f1] px-4 py-2.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              Проверить
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p
              className={`text-[13px] font-medium ${feedback === 'correct' ? 'text-[#2d8a66]' : 'text-[#b04472]'}`}
            >
              {feedback === 'correct' ? 'Верно!' : `Правильно: ${current.term}`}
            </p>
            <SrsRatingButtons
              onRate={(rating) => {
                onRate?.(current.id, rating)
                next()
              }}
            />
          </div>
        )}
      </div>
    </StudyShell>
  )
}
