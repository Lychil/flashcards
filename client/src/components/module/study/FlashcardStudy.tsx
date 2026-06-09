import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { StudyShell } from './StudyShell'

type CardRating = 'know' | 'repeat' | 'unknown'

interface FlashcardStudyProps {
  cards: Flashcard[]
  onBack: () => void
}

export function FlashcardStudy({ cards, onBack }: FlashcardStudyProps) {
  const [deck, setDeck] = useState(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState({ know: 0, repeat: 0, unknown: 0 })

  useEffect(() => {
    setDeck(shuffle(cards))
    setIndex(0)
    setFlipped(false)
    setStats({ know: 0, repeat: 0, unknown: 0 })
  }, [cards])

  const current = deck[index]
  const total = deck.length
  const progress = ((index + 1) / total) * 100

  const goNext = useCallback(() => {
    setFlipped(false)
    setIndex((i) => Math.min(i + 1, total - 1))
  }, [total])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const toggleFlip = useCallback(() => setFlipped((f) => !f), [])

  const rate = (rating: CardRating) => {
    setStats((s) => ({ ...s, [rating]: s[rating] + 1 }))
    if (index < total - 1) {
      setFlipped(false)
      setIndex((i) => i + 1)
    }
  }

  const handleShuffle = () => {
    setDeck(shuffle(cards))
    setIndex(0)
    setFlipped(false)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
      if (e.key === ' ') {
        e.preventDefault()
        toggleFlip()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goNext, goPrev, toggleFlip])

  const finished = useMemo(
    () => index === total - 1 && stats.know + stats.repeat + stats.unknown >= total,
    [index, stats, total],
  )

  if (!current) return null

  return (
    <StudyShell
      title="Карточки"
      subtitle={`${index + 1} из ${total}`}
      progress={progress}
      onBack={onBack}
    >
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={toggleFlip}
          className="flashcard-scene mb-6 w-full max-w-[640px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6366f1]"
        >
          <div className={['flashcard-inner', flipped ? 'is-flipped' : ''].join(' ')}>
            <div className="flashcard-face flex flex-col items-center justify-center rounded-[20px] border border-border bg-white px-8 py-10 shadow-[var(--shadow-card)]">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Термин
              </p>
              <p className="text-center text-[22px] font-semibold leading-snug tracking-[-0.02em] text-text-primary sm:text-[26px]">
                {current.term}
              </p>
            </div>
            <div className="flashcard-face flashcard-back flex flex-col items-center justify-center rounded-[20px] border border-border bg-white px-8 py-10 shadow-[var(--shadow-card)]">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Определение
              </p>
              <p className="text-center text-[18px] leading-relaxed text-text-primary sm:text-[20px]">
                {current.definition}
              </p>
            </div>
          </div>
        </button>

        {flipped && !finished && (
          <div className="mb-6 flex w-full max-w-[640px] flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => rate('know')}
              className="cursor-pointer rounded-xl bg-[#6BC9A7]/15 px-4 py-2.5 text-[13px] font-medium text-[#2d8a66] transition-colors hover:bg-[#6BC9A7]/25"
            >
              Знаю
            </button>
            <button
              type="button"
              onClick={() => rate('repeat')}
              className="cursor-pointer rounded-xl bg-[#F5B84C]/15 px-4 py-2.5 text-[13px] font-medium text-[#9a6b12] transition-colors hover:bg-[#F5B84C]/25"
            >
              Нужно повторить
            </button>
            <button
              type="button"
              onClick={() => rate('unknown')}
              className="cursor-pointer rounded-xl bg-[#E879A9]/15 px-4 py-2.5 text-[13px] font-medium text-[#b04472] transition-colors hover:bg-[#E879A9]/25"
            >
              Не знаю
            </button>
          </div>
        )}

        {finished && (
          <div className="mb-6 rounded-[16px] border border-border bg-surface-subtle px-4 py-3 text-center text-[13px] text-text-secondary">
            Знаю: {stats.know} · Повторить: {stats.repeat} · Не знаю: {stats.unknown}
          </div>
        )}

        <div className="flex w-full max-w-[640px] items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-[#d4d9e0] hover:text-text-primary"
          >
            <Shuffle size={15} strokeWidth={1.75} />
            Перемешать
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:border-[#d4d9e0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={20} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={index === total - 1}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-text-secondary transition-colors hover:border-[#d4d9e0] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={20} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </StudyShell>
  )
}
