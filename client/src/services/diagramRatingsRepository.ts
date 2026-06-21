import { STORAGE_KEYS } from './storageKeys'

interface RatingAggregate {
  sum: number
  count: number
}

interface RatingsStore {
  userRatings: Record<string, number>
  aggregates: Record<string, RatingAggregate>
}

function readStore(): RatingsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.diagramRatings)
    if (!raw) return { userRatings: {}, aggregates: {} }
    const parsed = JSON.parse(raw) as Partial<RatingsStore>
    return {
      userRatings: parsed.userRatings ?? {},
      aggregates: parsed.aggregates ?? {},
    }
  } catch {
    return { userRatings: {}, aggregates: {} }
  }
}

function writeStore(store: RatingsStore): void {
  localStorage.setItem(STORAGE_KEYS.diagramRatings, JSON.stringify(store))
}

export const diagramRatingsRepository = {
  loadUserRatings(): Record<string, number> {
    return readStore().userRatings
  },

  getUserRating(diagramId: string): number {
    return readStore().userRatings[diagramId] ?? 0
  },

  getAverageRating(diagramId: string): number {
    const aggregate = readStore().aggregates[diagramId]
    if (!aggregate || aggregate.count === 0) return 0
    return Math.round((aggregate.sum / aggregate.count) * 10) / 10
  },

  rate(diagramId: string, stars: number): { averageRating: number; userRating: number } {
    const rating = Math.min(5, Math.max(1, Math.round(stars)))
    const store = readStore()
    const previousRating = store.userRatings[diagramId] ?? null
    let aggregate = store.aggregates[diagramId] ?? { sum: 0, count: 0 }

    aggregate =
      previousRating !== null
        ? { sum: aggregate.sum - previousRating + rating, count: aggregate.count }
        : { sum: aggregate.sum + rating, count: aggregate.count + 1 }

    store.userRatings[diagramId] = rating
    store.aggregates[diagramId] = aggregate
    writeStore(store)

    return {
      averageRating: Math.round((aggregate.sum / aggregate.count) * 10) / 10,
      userRating: rating,
    }
  },
}
