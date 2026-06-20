import { useCallback, useEffect, useMemo, useState } from 'react'
import { ensureCardSrs } from '../lib/enrichFlashcards'
import { applySrsRating, createDefaultSrs } from '../lib/spacedRepetition'
import { cardRepository } from '../services/cardRepository'
import type { Flashcard } from '../types/flashcard'
import type { SrsRating } from '../types/srs'

function mergeWithDefaults(seed: Flashcard[], persisted: Flashcard[] | null): Flashcard[] {
  if (!persisted) {
    return seed.map(ensureCardSrs)
  }

  const persistedById = new Map(persisted.map((c) => [c.id, c]))
  const seedIds = new Set(seed.map((c) => c.id))

  const merged = seed.map((card) => {
    const saved = persistedById.get(card.id)
    return saved ? { ...card, ...saved, srs: saved.srs ?? card.srs ?? createDefaultSrs() } : ensureCardSrs(card)
  })

  for (const card of persisted) {
    if (!seedIds.has(card.id)) {
      merged.push(ensureCardSrs(card))
    }
  }

  return merged
}

export function useModuleCards(moduleId: string, seedCards: Flashcard[] | undefined) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!moduleId || seedCards === undefined) return

    const persisted = cardRepository.loadCards(moduleId)
    setCards(mergeWithDefaults(seedCards, persisted))
    setInitialized(true)
  }, [moduleId, seedCards])

  const persist = useCallback(
    (next: Flashcard[]) => {
      setCards(next)
      if (moduleId) cardRepository.saveCards(moduleId, next)
    },
    [moduleId],
  )

  const rateCard = useCallback(
    (cardId: string, rating: SrsRating) => {
      setCards((prev) => {
        const next = prev.map((card) => {
          if (card.id !== cardId) return card
          const srs = applySrsRating(card.srs ?? createDefaultSrs(), rating)
          return { ...card, srs }
        })
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })
    },
    [moduleId],
  )

  const addCard = useCallback(
    (card: Omit<Flashcard, 'id'>) => {
      const next: Flashcard = {
        ...card,
        id: `local-${Date.now()}`,
        srs: card.srs ?? createDefaultSrs(),
      }
      setCards((prev) => {
        const updated = [...prev, next]
        if (moduleId) cardRepository.saveCards(moduleId, updated)
        return updated
      })
    },
    [moduleId],
  )

  const updateCard = useCallback(
    (cardId: string, patch: Partial<Omit<Flashcard, 'id'>>) => {
      setCards((prev) => {
        const next = prev.map((c) => (c.id === cardId ? { ...c, ...patch } : c))
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })
    },
    [moduleId],
  )

  const deleteCards = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      setCards((prev) => {
        const next = prev.filter((c) => !idSet.has(c.id))
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })
    },
    [moduleId],
  )

  const replaceCards = useCallback(
    (next: Flashcard[]) => {
      persist(next.map(ensureCardSrs))
    },
    [persist],
  )

  const importCards = useCallback(
    (imported: Omit<Flashcard, 'id'>[], mode: 'merge' | 'replace') => {
      const nextCards = imported.map((card, index) => ({
        ...card,
        id: `import-${Date.now()}-${index}`,
        srs: card.srs ?? createDefaultSrs(),
      }))

      setCards((prev) => {
        const next = mode === 'replace' ? nextCards : [...prev, ...nextCards]
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })

      return nextCards.length
    },
    [moduleId],
  )

  const saveAll = useCallback(
    (next: Flashcard[]) => {
      persist(next)
    },
    [persist],
  )

  return useMemo(
    () => ({
      cards,
      initialized,
      rateCard,
      addCard,
      updateCard,
      deleteCards,
      replaceCards,
      importCards,
      saveAll,
      setCards: persist,
    }),
    [cards, initialized, rateCard, addCard, updateCard, deleteCards, replaceCards, importCards, saveAll, persist],
  )
}

export function loadAllModuleCards(
  moduleIds: string[],
  getSeed: (moduleId: string) => Flashcard[],
): Record<string, Flashcard[]> {
  const result: Record<string, Flashcard[]> = {}
  for (const id of moduleIds) {
    const seed = getSeed(id)
    const persisted = cardRepository.loadCards(id)
    result[id] = mergeWithDefaults(seed, persisted)
  }
  return result
}
