import { getCardSrsChoice } from './cardSrsChoice'
import type { CardFilter, Flashcard } from '../types/flashcard'

export interface CardStats {
  total: number
  know: number
  repeat: number
  dont_know: number
}

export function getCardStats(cards: Flashcard[], now = Date.now()): CardStats {
  const stats: CardStats = {
    total: cards.length,
    know: 0,
    repeat: 0,
    dont_know: 0,
  }

  for (const card of cards) {
    const choice = getCardSrsChoice(card, now)
    stats[choice] += 1
  }

  return stats
}

export function filterCardsByTab(cards: Flashcard[], filter: CardFilter, now = Date.now()): Flashcard[] {
  if (filter === 'all') return cards
  return cards.filter((card) => getCardSrsChoice(card, now) === filter)
}

export function matchesCardSearch(card: Flashcard, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    card.term.toLowerCase().includes(q) ||
    card.definition.toLowerCase().includes(q)
  )
}
