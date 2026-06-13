import {
  applySrsRating,
  createDefaultSrs,
  getSrsVisualStatus,
  SRS_INTERVALS,
} from './spacedRepetition'
import type { Flashcard } from '../types/flashcard'
import type { CardSrsData, CardSrsChoice, SrsRating } from '../types/srs'

export const CARD_SRS_CHOICE_META: Record<
  CardSrsChoice,
  { label: string; color: string; pillClass: string }
> = {
  know: {
    label: 'Знаю',
    color: '#6BC9A7',
    pillClass: 'bg-[#6BC9A7]/15 text-[#2d8a66]',
  },
  repeat: {
    label: 'Повторить',
    color: '#F5B84C',
    pillClass: 'bg-[#F5B84C]/15 text-[#9a6b12]',
  },
  dont_know: {
    label: 'Не знаю',
    color: '#E879A9',
    pillClass: 'bg-[#E879A9]/15 text-[#b04472]',
  },
}

export const CARD_SRS_CHOICES = (
  Object.entries(CARD_SRS_CHOICE_META) as [CardSrsChoice, (typeof CARD_SRS_CHOICE_META)[CardSrsChoice]][]
).map(([value, meta]) => ({ value, label: meta.label }))

const CHOICE_TO_RATING: Record<CardSrsChoice, SrsRating> = {
  know: 'good',
  repeat: 'hard',
  dont_know: 'again',
}

export function getCardSrsChoice(card: Flashcard, now = Date.now()): CardSrsChoice {
  const srs = card.srs ?? createDefaultSrs(now)
  const status = getSrsVisualStatus(card, now)

  if (status === 'review' || status === 'mature') {
    return 'know'
  }

  if (
    srs.repetitions === 0 &&
    srs.lastReviewedAt &&
    srs.intervalMs <= SRS_INTERVALS.again
  ) {
    return 'dont_know'
  }

  return 'repeat'
}

export function applyCardSrsChoice(
  srs: CardSrsData,
  choice: CardSrsChoice,
  now = Date.now(),
): CardSrsData {
  return applySrsRating(srs, CHOICE_TO_RATING[choice], now)
}

export function cardSrsChoiceToRating(choice: CardSrsChoice): SrsRating {
  return CHOICE_TO_RATING[choice]
}
