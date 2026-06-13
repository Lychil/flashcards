import { createDefaultSrs } from './spacedRepetition'
import type { Flashcard } from '../types/flashcard'

const DAY = 24 * 60 * 60 * 1000

function mockSrsForIndex(index: number, now: number) {
  const base = createDefaultSrs(now)

  if (index % 5 === 0) {
    return {
      ...base,
      repetitions: 4,
      intervalMs: 45 * DAY,
      nextReviewAt: now + 45 * DAY,
      lastReviewedAt: now - 2 * DAY,
    }
  }

  if (index % 4 === 0) {
    return {
      ...base,
      repetitions: 2,
      intervalMs: 3 * DAY,
      nextReviewAt: now + 3 * DAY,
      lastReviewedAt: now - DAY,
    }
  }

  if (index % 7 === 0) {
    return {
      ...base,
      repetitions: 1,
      intervalMs: 6 * 60 * 60 * 1000,
      nextReviewAt: now + 6 * 60 * 60 * 1000,
      lastReviewedAt: now - 2 * 60 * 60 * 1000,
    }
  }

  if (index % 6 === 0) {
    return {
      ...base,
      repetitions: 0,
      intervalMs: 0,
      nextReviewAt: now - 60 * 1000,
    }
  }

  return base
}

export function enrichFlashcards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now()

  return cards.map((card, index) => ({
    ...card,
    srs: card.srs ?? mockSrsForIndex(index, now),
  }))
}

export function ensureCardSrs(card: Flashcard): Flashcard {
  return card.srs ? card : { ...card, srs: createDefaultSrs() }
}
