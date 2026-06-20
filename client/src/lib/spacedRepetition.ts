/** Re-exports FSRS-backed SRS API (legacy import path). */
export {
  applySrsRating,
  createDefaultSrs,
  formatNextReview,
  getModuleSrsStats,
  getSrsVisualStatus,
  inferRatingFromCorrectness,
  isCardDue,
  isNewCard,
  getRetrievability,
  TARGET_RETENTION,
} from './fsrsEngine'

export type { ModuleSrsStats } from './fsrsEngine'

import type { Flashcard } from '../types/flashcard'
import { getRetrievability } from './fsrsEngine'

export const SRS_STATUS_COLORS = {
  due: '#E879A9',
  learning: '#F5B84C',
  review: '#6BC9A7',
  mature: '#5B9FD4',
} as const

export const SRS_STATUS_LABELS = {
  due: 'Нужно повторить',
  learning: 'В процессе',
  review: 'Закреплено',
  mature: 'Вне поля зрения',
} as const

/** @deprecated intervals are computed by FSRS */
export const SRS_INTERVALS = {
  again: 60_000,
  hard: 12 * 60 * 60 * 1000,
  good: 2 * 24 * 60 * 60 * 1000,
  easy: Math.round(4.5 * 24 * 60 * 60 * 1000),
} as const

export function getForgettingCurvePoints(
  cards: Flashcard[],
  days = 5,
): { day: number; retention: number }[] {
  const total = Math.max(cards.length, 1)
  return Array.from({ length: days + 1 }, (_, day) => {
    const at = Date.now() + day * 24 * 60 * 60 * 1000
    const sum = cards.reduce((acc, c) => acc + getRetrievability(c, at), 0)
    const retention = Math.round((sum / total) * 100)
    return { day, retention }
  })
}

export function getDueTimestamp(card: Flashcard): number {
  return card.srs?.due ?? Date.now()
}
