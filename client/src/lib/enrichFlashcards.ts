import { createDefaultSrs } from './spacedRepetition'
import type { Flashcard } from '../types/flashcard'

export function enrichFlashcards(cards: Flashcard[]): Flashcard[] {
  return cards.map((card) => ensureCardSrs(card))
}

export function ensureCardSrs(card: Flashcard): Flashcard {
  return card.srs?.v === 2 ? card : { ...card, srs: createDefaultSrs() }
}
