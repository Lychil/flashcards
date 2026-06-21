import { ensureCardSrs } from './enrichFlashcards'
import { createDefaultSrs } from './spacedRepetition'
import type { Flashcard } from '../types/flashcard'

export function mergeModuleCards(seed: Flashcard[], persisted: Flashcard[] | null): Flashcard[] {
  if (!persisted) {
    return seed.map(ensureCardSrs)
  }

  const persistedById = new Map(persisted.map((c) => [c.id, c]))
  const seedIds = new Set(seed.map((c) => c.id))

  const merged = seed.map((card) => {
    const saved = persistedById.get(card.id)
    return saved
      ? { ...card, ...saved, srs: saved.srs ?? card.srs ?? createDefaultSrs() }
      : ensureCardSrs(card)
  })

  for (const card of persisted) {
    if (!seedIds.has(card.id)) {
      merged.push(ensureCardSrs(card))
    }
  }

  return merged
}
