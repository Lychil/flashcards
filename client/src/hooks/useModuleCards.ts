import { useCallback, useEffect, useMemo, useState } from 'react'
import { ensureCardSrs } from '../lib/enrichFlashcards'
import { mergeModuleCards } from '../lib/mergeModuleCards'
import { applySrsRating, createDefaultSrs } from '../lib/spacedRepetition'
import { cardRepository } from '../services/cardRepository'
import type { Flashcard } from '../types/flashcard'
import type { SrsRating } from '../types/srs'

export function useModuleCards(
  moduleId: string,
  seedCards: Flashcard[] | undefined,
  options?: { requestRetention?: number; contentReadOnly?: boolean },
) {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!moduleId || seedCards === undefined) return

    const persisted = cardRepository.loadCards(moduleId)
    setCards(mergeModuleCards(seedCards, persisted))
    setInitialized(true)
  }, [moduleId, seedCards])

  const persist = useCallback(
    (next: Flashcard[]) => {
      setCards(next)
      if (moduleId) cardRepository.saveCards(moduleId, next)
    },
    [moduleId],
  )

  const requestRetention = options?.requestRetention
  const contentReadOnly = options?.contentReadOnly ?? false

  const rateCard = useCallback(
    (cardId: string, rating: SrsRating) => {
      setCards((prev) => {
        const next = prev.map((card) => {
          if (card.id !== cardId) return card
          const srs = applySrsRating(
            card.srs ?? createDefaultSrs(),
            rating,
            Date.now(),
            requestRetention,
          )
          return { ...card, srs }
        })
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })
    },
    [moduleId, requestRetention],
  )

  const addCard = useCallback(
    (card: Omit<Flashcard, 'id'>) => {
      if (contentReadOnly) return
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
    [moduleId, contentReadOnly],
  )

  const updateCard = useCallback(
    (cardId: string, patch: Partial<Omit<Flashcard, 'id'>>) => {
      if (contentReadOnly) return
      setCards((prev) => {
        const next = prev.map((c) => (c.id === cardId ? { ...c, ...patch } : c))
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })
    },
    [moduleId, contentReadOnly],
  )

  const deleteCards = useCallback(
    (ids: string[]) => {
      if (contentReadOnly) return
      const idSet = new Set(ids)
      setCards((prev) => {
        const next = prev.filter((c) => !idSet.has(c.id))
        if (moduleId) cardRepository.saveCards(moduleId, next)
        return next
      })
    },
    [moduleId, contentReadOnly],
  )

  const replaceCards = useCallback(
    (next: Flashcard[]) => {
      persist(next.map(ensureCardSrs))
    },
    [persist],
  )

  const importCards = useCallback(
    (imported: Omit<Flashcard, 'id'>[], mode: 'merge' | 'replace') => {
      if (contentReadOnly) return 0
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
    [moduleId, contentReadOnly],
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
    result[id] = mergeModuleCards(seed, persisted)
  }
  return result
}
