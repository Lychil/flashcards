import {
  createEmptyCard,
  FSRS,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from 'ts-fsrs'
import type { Flashcard } from '../types/flashcard'
import type { CardDifficultyLevel, CardSrsData, SrsRating, SrsVisualStatus } from '../types/srs'

const DAY_MS = 24 * 60 * 60 * 1000

export const TARGET_RETENTION = 0.9

/** Max new cards introduced per day when no exam plan overrides */
export const DAILY_NEW_CARD_LIMIT = 15

export const fsrs = new FSRS(
  generatorParameters({
    request_retention: TARGET_RETENTION,
    enable_fuzz: false,
  }),
)

const RATING_MAP: Record<SrsRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
}

function isFsrsV2(srs: CardSrsData | LegacySrs | undefined): srs is CardSrsData {
  return srs !== undefined && srs.v === 2
}

/** @deprecated legacy shape — migrated on read */
interface LegacySrs {
  repetitions?: number
  easeFactor?: number
  intervalMs?: number
  nextReviewAt?: number
  lastReviewedAt?: number
  v?: number
}

export function createDefaultSrs(now = Date.now()): CardSrsData {
  return fromFsrsCard(createEmptyCard(new Date(now)))
}

export function fromFsrsCard(card: Card): CardSrsData {
  return {
    v: 2,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduledDays: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as 0 | 1 | 2 | 3,
    lastReview: card.last_review?.getTime(),
    learningSteps: card.learning_steps,
  }
}

export function toFsrsCard(srs: CardSrsData | LegacySrs | undefined, now = Date.now()): Card {
  if (!srs) return createEmptyCard(new Date(now))
  if (isFsrsV2(srs)) {
    return {
      due: new Date(srs.due),
      stability: srs.stability,
      difficulty: srs.difficulty,
      elapsed_days: 0,
      scheduled_days: srs.scheduledDays,
      learning_steps: srs.learningSteps,
      reps: srs.reps,
      lapses: srs.lapses,
      state: srs.state as State,
      last_review: srs.lastReview ? new Date(srs.lastReview) : undefined,
    }
  }
  return migrateLegacySrs(srs as LegacySrs, now)
}

function migrateLegacySrs(legacy: LegacySrs, now: number): Card {
  const card = createEmptyCard(new Date(now))
  const reps = legacy.repetitions ?? 0
  if (reps === 0 && !legacy.lastReviewedAt) return card

  card.state = State.Review
  card.reps = reps
  card.stability = Math.max(0.1, (legacy.intervalMs ?? DAY_MS) / DAY_MS)
  card.difficulty = Math.min(10, Math.max(1, 11 - (legacy.easeFactor ?? 2.5) * 2))
  card.due = new Date(legacy.nextReviewAt ?? now)
  card.scheduled_days = card.stability
  card.last_review = legacy.lastReviewedAt ? new Date(legacy.lastReviewedAt) : undefined
  return card
}

export function applySrsRating(
  srs: CardSrsData | LegacySrs | undefined,
  rating: SrsRating,
  now = Date.now(),
): CardSrsData {
  const card = toFsrsCard(srs, now)
  const result = fsrs.next(card, new Date(now), RATING_MAP[rating])
  return fromFsrsCard(result.card)
}

export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isCardDue(card: Flashcard, now = Date.now()): boolean {
  const fsrsCard = toFsrsCard(card.srs, now)
  if (fsrsCard.state === State.New) return false
  return fsrsCard.due.getTime() <= now
}

export function isNewCard(card: Flashcard): boolean {
  return toFsrsCard(card.srs).state === State.New
}

export function getDueTimestamp(card: Flashcard): number {
  return toFsrsCard(card.srs).due.getTime()
}

export function getRetrievability(card: Flashcard, at = Date.now()): number {
  const fsrsCard = toFsrsCard(card.srs, at)
  if (fsrsCard.state === State.New) return 0
  return fsrs.get_retrievability(fsrsCard, new Date(at), false)
}

export function getDifficultyLevel(card: Flashcard): CardDifficultyLevel {
  const d = toFsrsCard(card.srs).difficulty
  if (d < 4) return 'easy'
  if (d < 6.5) return 'medium'
  if (d < 8.5) return 'hard'
  return 'very_hard'
}

export const DIFFICULTY_META: Record<
  CardDifficultyLevel,
  { label: string; color: string; pillClass: string }
> = {
  easy: { label: 'Лёгкая', color: '#5B9FD4', pillClass: 'bg-[#5B9FD4]/12 text-[#3a7aad]' },
  medium: { label: 'Средняя', color: '#6BC9A7', pillClass: 'bg-[#6BC9A7]/12 text-[#2d8a66]' },
  hard: { label: 'Сложная', color: '#F5B84C', pillClass: 'bg-[#F5B84C]/12 text-[#9a6b12]' },
  very_hard: { label: 'Очень сложная', color: '#E879A9', pillClass: 'bg-[#E879A9]/12 text-[#b04472]' },
}

export function getDifficultySortKey(card: Flashcard): number {
  return toFsrsCard(card.srs).difficulty
}

export function sortCardsByDifficulty(cards: Flashcard[], hardFirst = true): Flashcard[] {
  return [...cards].sort((a, b) => {
    const diff = getDifficultySortKey(b) - getDifficultySortKey(a)
    return hardFirst ? diff : -diff
  })
}

export function toDateKey(date: Date | number = Date.now()): string {
  const d = typeof date === 'number' ? new Date(date) : date
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getSrsVisualStatus(card: Flashcard, now = Date.now()): SrsVisualStatus {
  const c = toFsrsCard(card.srs, now)
  if (c.state === State.New) return 'learning'
  if (c.due.getTime() <= now) return 'due'
  if (c.state === State.Learning || c.state === State.Relearning) return 'learning'
  if (c.stability < 30) return 'review'
  return 'mature'
}

export function formatNextReview(nextReviewAt: number, now = Date.now()): string {
  const diff = nextReviewAt - now
  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = DAY_MS

  if (diff <= 0) return 'Сейчас'
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

  if (date.toDateString() === today.toDateString()) return `сегодня в ${time}`
  if (date.toDateString() === tomorrow.toDateString()) return `завтра в ${time}`

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

export function getCardsDueBefore(cards: Flashcard[], before: Date, now = Date.now()): Flashcard[] {
  const ts = before.getTime()
  return cards.filter((c) => {
    const fc = toFsrsCard(c.srs, now)
    return fc.state !== State.New && fc.due.getTime() <= ts
  })
}

export function simulateReview(card: Flashcard, rating: SrsRating, at: Date): Card {
  return toFsrsCard(applySrsRating(card.srs, rating, at.getTime()))
}

export function cloneFsrsCard(card: Card): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  }
}

export function flashcardFromSim(id: string, term: string, definition: string, fc: Card): Flashcard {
  return { id, term, definition, srs: fromFsrsCard(fc) }
}
