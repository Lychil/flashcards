import { STORAGE_KEYS } from './storageKeys'

interface ReviewDailyLog {
  date: string
  newCards: number
  reviews: number
}

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function load(): ReviewDailyLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reviewDaily)
    if (!raw) return { date: todayKey(), newCards: 0, reviews: 0 }
    const parsed = JSON.parse(raw) as ReviewDailyLog
    if (parsed.date !== todayKey()) {
      return { date: todayKey(), newCards: 0, reviews: 0 }
    }
    return parsed
  } catch {
    return { date: todayKey(), newCards: 0, reviews: 0 }
  }
}

function save(log: ReviewDailyLog) {
  localStorage.setItem(STORAGE_KEYS.reviewDaily, JSON.stringify(log))
}

export const reviewDailyRepository = {
  getNewCardsIntroducedToday(): number {
    return load().newCards
  },

  getReviewsToday(): number {
    return load().reviews
  },

  recordReview(count = 1): void {
    const log = load()
    log.reviews += count
    save(log)
  },

  recordNewCard(count = 1): void {
    const log = load()
    log.newCards += count
    save(log)
  },
}
