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
  }, [deckKey])

  const current = deck[index]
  const total = deck.length
  const progress = total === 0 ? 0 : (ratedCount / total) * 100

  const toggleFlip = useCallback(() => {
    if (!current) return
    setFlipped((f) => !f)
  }, [current])

  const rate = (rating: SrsRating) => {
    if (!current || !flipped) return
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
      title="Повторение"
      subtitle={finished ? `Оценено ${ratedCount} из ${total}` : `${index + 1} из ${total}`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={toggleFlip}
          className="mb-6 w-full max-w-[640px] cursor-pointer rounded-[22px] border border-border bg-white px-6 py-10 hover:border-[#d4d9e0] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7F77DD] sm:px-10 sm:py-12 min-h-[280px] sm:min-h-[320px] flex flex-col items-center justify-center"
        >
          {!flipped ? (
            <>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Термин
              </p>
              <p className="w-full text-center text-[28px] font-semibold leading-snug tracking-[-0.02em] text-text-primary sm:text-[36px]">
                {current.term || '—'}
              </p>
              <p className="mt-8 text-[13px] text-text-tertiary">Нажмите, чтобы открыть ответ</p>
            </>
          ) : (
            <>
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Определение
              </p>
              <p className="mb-4 line-clamp-2 text-center text-[15px] text-text-tertiary">{current.term}</p>
              <p className="w-full text-center text-[22px] leading-relaxed text-text-primary sm:text-[26px]">
                {current.definition || '—'}
              </p>
            </>
          )}
        </button>

        {!finished && flipped && (
          <div className="mb-6 w-full max-w-[640px]">
            <p className="mb-3 text-center text-[12px] font-medium text-text-secondary">
              Насколько хорошо вспомнили?
            </p>
            <CardSrsChoiceButtons onRate={rate} />
          </div>
        )}

        {!finished && !flipped && (
          <p className="mb-6 text-[13px] text-text-tertiary">Сначала вспомните ответ, затем откройте карточку</p>
        )}

        {finished && (
          <div className="mb-6 rounded-[16px] bg-surface-subtle px-4 py-3 text-center text-[13px] text-text-secondary">
            Сессия завершена · оценено {ratedCount} карточек
          </div>
        )}

        <div className="flex w-full max-w-[640px] justify-center">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          >
            Перемешать
          </button>
        </div>
      </div>
    </StudyShell>
  )
}
