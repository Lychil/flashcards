import { Shuffle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { shuffle } from '../../../lib/shuffle'
import type { SrsRating } from '../../../types/srs'
import type { Flashcard } from '../../../types/flashcard'
import { CardSrsChoiceButtons } from '../CardSrsChoiceButtons'
import { StudyShell } from './StudyShell'

interface FlashcardStudyProps {
  cards: Flashcard[]
  accentColor?: string
  onRate?: (cardId: string, rating: SrsRating) => void
}

export function FlashcardStudy({ cards, accentColor, onRate }: FlashcardStudyProps) {
  const [deck, setDeck] = useState(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [ratedCount, setRatedCount] = useState(0)

  const deckKey = useMemo(() => cards.map((card) => card.id).join(','), [cards])

  useEffect(() => {
    setDeck(shuffle(cards))
    setIndex(0)
    setFlipped(false)
    setRatedCount(0)
  }, [deckKey]) // cards intentionally omitted — SRS updates must not reset the session

  const current = deck[index]
  const total = deck.length
  const progress = total === 0 ? 0 : (ratedCount / total) * 100

  const toggleFlip = useCallback(() => setFlipped((f) => !f), [])

  const rate = (rating: SrsRating) => {
    if (!current) return
    onRate?.(current.id, rating)
    setRatedCount((c) => c + 1)
    if (index < total - 1) {
      setFlipped(false)
      setIndex((i) => i + 1)
    }
  }

  const handleShuffle = () => {
    setDeck(shuffle(cards))
    setIndex(0)
    setFlipped(false)
    setRatedCount(0)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        toggleFlip()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleFlip])

  const finished = ratedCount >= total

  if (!current) return null

  return (
    <StudyShell
      title="Карточки"
      subtitle={finished ? `Оценено ${ratedCount} из ${total}` : `${index + 1} из ${total}`}
      progress={progress}
      accentColor={accentColor}
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
                Лицевая сторона
              </p>
              <p className="text-center text-[22px] font-semibold leading-snug tracking-[-0.02em] text-text-primary sm:text-[26px]">
                {current.term}
              </p>
            </div>
            <div className="flashcard-face flashcard-back flex flex-col items-center justify-center rounded-[20px] border border-border bg-white px-8 py-10 shadow-[var(--shadow-card)]">
              <p className="mb-4 text-[13px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
                Обратная сторона
              </p>
              <p className="text-center text-[18px] leading-relaxed text-text-primary sm:text-[20px]">
                {current.definition}
              </p>
            </div>
          </div>
        </button>

        {!finished && (
          <div className="mb-6 w-full max-w-[640px]">
            <p className="mb-3 text-center text-[12px] font-medium text-text-secondary">
              Оцените карточку
            </p>
            <CardSrsChoiceButtons onRate={rate} />
          </div>
        )}

        {finished && (
          <div className="mb-6 rounded-[16px] border border-border bg-surface-subtle px-4 py-3 text-center text-[13px] text-text-secondary">
            Сессия завершена · оценено {ratedCount} карточек
          </div>
        )}

        <div className="flex w-full max-w-[640px] justify-center">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-[#d4d9e0] hover:text-text-primary"
          >
            <Shuffle size={15} strokeWidth={1.75} />
            Перемешать
          </button>
        </div>
      </div>
    </StudyShell>
  )
}
