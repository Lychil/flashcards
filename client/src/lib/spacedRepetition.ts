import type { CardSrsData, SrsRating, SrsVisualStatus } from '../types/srs'
import type { Flashcard } from '../types/flashcard'

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const SRS_INTERVALS = {
  again: 1 * MINUTE,
  hard: 12 * HOUR,
  good: 2 * DAY,
  easy: Math.round(4.5 * DAY),
} as const

export const SRS_STATUS_COLORS: Record<SrsVisualStatus, string> = {
  due: '#E879A9',
  learning: '#F5B84C',
  review: '#6BC9A7',
  mature: '#5B9FD4',
}

export const SRS_STATUS_LABELS: Record<SrsVisualStatus, string> = {
  due: 'Нужно повторить',
  learning: 'В процессе',
  review: 'Закреплено',
  mature: 'Вне поля зрения',
}

export function createDefaultSrs(now = Date.now()): CardSrsData {
  return {
    repetitions: 0,
    easeFactor: 2.5,
    intervalMs: 0,
    nextReviewAt: now,
  }
}

export function applySrsRating(
  srs: CardSrsData,
  rating: SrsRating,
  now = Date.now(),
): CardSrsData {
  let { repetitions, easeFactor, intervalMs } = srs

  if (rating === 'again') {
    repetitions = 0
    intervalMs = SRS_INTERVALS.again
    easeFactor = Math.max(1.3, easeFactor - 0.2)
  } else if (rating === 'hard') {
    repetitions += 1
    intervalMs = SRS_INTERVALS.hard
    easeFactor = Math.max(1.3, easeFactor - 0.15)
  } else if (rating === 'good') {
    repetitions += 1
    intervalMs =
      repetitions <= 1 ? SRS_INTERVALS.good : Math.round(intervalMs * easeFactor)
  } else {
    repetitions += 1
    intervalMs =
      repetitions <= 1
        ? SRS_INTERVALS.easy
        : Math.round(intervalMs * easeFactor * 1.3)
    easeFactor = Math.min(3.0, easeFactor + 0.15)
  }

  return {
    repetitions,
    easeFactor,
    intervalMs,
    nextReviewAt: now + intervalMs,
    lastReviewedAt: now,
  }
}

export function getSrsVisualStatus(
  card: Flashcard,
  now = Date.now(),
): SrsVisualStatus {
  const srs = card.srs ?? createDefaultSrs(now)

  if (srs.repetitions === 0 || srs.nextReviewAt <= now) {
    return 'due'
  }

  if (srs.intervalMs < DAY) {
    return 'learning'
  }

  if (srs.intervalMs < 30 * DAY) {
    return 'review'
  }

  return 'mature'
}

export function formatNextReview(nextReviewAt: number, now = Date.now()): string {
  const diff = nextReviewAt - now

  if (diff <= 0) {
    return 'Сейчас'
  }

  if (diff < HOUR) {
    const mins = Math.max(1, Math.round(diff / MINUTE))
    return `через ${mins} ${mins === 1 ? 'минуту' : mins < 5 ? 'минуты' : 'минут'}`
  }

  if (diff < DAY) {
    const hours = Math.max(1, Math.round(diff / HOUR))
    return `через ${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}`
  }

  const date = new Date(nextReviewAt)
  const today = new Date(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(today.getDate() + 1)

  const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  if (date.toDateString() === today.toDateString()) {
    return `сегодня в ${time}`
  }

  if (date.toDateString() === tomorrow.toDateString()) {
    return `завтра в ${time}`
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface ModuleSrsStats {
  due: number
  learning: number
  mastered: number
  total: number
  masteryPercent: number
}

export function getModuleSrsStats(cards: Flashcard[], now = Date.now()): ModuleSrsStats {
  let due = 0
  let learning = 0
  let mastered = 0

  for (const card of cards) {
    const status = getSrsVisualStatus(card, now)
    if (status === 'due') due += 1
    else if (status === 'learning') learning += 1
    else mastered += 1
  }

  const total = cards.length
  const masteryPercent = total === 0 ? 0 : Math.round((mastered / total) * 100)

  return { due, learning, mastered, total, masteryPercent }
}

export function inferRatingFromCorrectness(isCorrect: boolean): SrsRating {
  return isCorrect ? 'good' : 'again'
}

export function getForgettingCurvePoints(
  cards: Flashcard[],
  days = 5,
): { day: number; retention: number }[] {
  const total = Math.max(cards.length, 1)
  const dueNow = cards.filter((c) => getSrsVisualStatus(c) === 'due').length
  const fragileShare = dueNow / total

  return Array.from({ length: days + 1 }, (_, day) => {
    const decay = fragileShare * 18 + day * (8 + fragileShare * 6)
    const retention = Math.max(35, Math.round(100 - decay))
    return { day, retention }
  })
}
