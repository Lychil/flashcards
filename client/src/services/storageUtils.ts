import type { RatingAggregate, RatingsStore } from '../types/common'

const EMPTY_RATING_AGGREGATE: RatingAggregate = { sum: 0, count: 0 }

function uniqueStringIds(ids: string[]): string[] {
  return Array.from(new Set(ids))
}

function clampRating(stars: number): number {
  return Math.min(5, Math.max(1, Math.round(stars)))
}

function roundAverage(aggregate: RatingAggregate): number {
  if (aggregate.count <= 0) return 0
  return Math.round((aggregate.sum / aggregate.count) * 10) / 10
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function createIdListRepository(storageKey: string, seedIds: string[] = []) {
  const initialIds = uniqueStringIds(seedIds)

  const readIds = (): string[] => {
    const parsed = readJson<unknown>(storageKey)
    if (!parsed) return initialIds

    return Array.isArray(parsed)
      ? uniqueStringIds(parsed.filter((id): id is string => typeof id === 'string'))
      : initialIds
  }

  const writeIds = (ids: string[]): void => {
    writeJson(storageKey, uniqueStringIds(ids))
  }

  return {
    loadAll(): string[] {
      return readIds()
    },

    isFavorited(id: string): boolean {
      return readIds().includes(id)
    },

    toggle(id: string): boolean {
      const ids = readIds()
      const index = ids.indexOf(id)

      if (index >= 0) {
        writeIds(ids.filter((itemId) => itemId !== id))
        return false
      }

      writeIds([...ids, id])
      return true
    },
  }
}

export function createRatingsRepository(storageKey: string) {
  const readStore = (): RatingsStore => {
    const parsed = readJson<Partial<RatingsStore>>(storageKey)

    return {
      userRatings: parsed?.userRatings ?? {},
      aggregates: parsed?.aggregates ?? {},
    }
  }

  const writeStore = (store: RatingsStore): void => {
    writeJson(storageKey, store)
  }

  const previewRate = (
    id: string,
    stars: number,
    initialAggregate: RatingAggregate = EMPTY_RATING_AGGREGATE,
  ): { averageRating: number; userRating: number; previousRating: number | null } => {
    const rating = clampRating(stars)
    const store = readStore()
    const previousRating = store.userRatings[id] ?? null
    const aggregate = store.aggregates[id] ?? initialAggregate
    const nextAggregate =
      previousRating !== null
        ? { sum: aggregate.sum - previousRating + rating, count: aggregate.count }
        : { sum: aggregate.sum + rating, count: aggregate.count + 1 }

    return {
      averageRating: roundAverage(nextAggregate),
      userRating: rating,
      previousRating,
    }
  }

  return {
    loadUserRatings(): Record<string, number> {
      return readStore().userRatings
    },

    getUserRating(id: string): number | null {
      return readStore().userRatings[id] ?? null
    },

    getAverageRating(id: string): number {
      return roundAverage(readStore().aggregates[id] ?? EMPTY_RATING_AGGREGATE)
    },

    previewRate,

    rate(
      id: string,
      stars: number,
      initialAggregate: RatingAggregate = EMPTY_RATING_AGGREGATE,
    ): { averageRating: number; userRating: number; previousRating: number | null } {
      const result = previewRate(id, stars, initialAggregate)
      const store = readStore()
      const aggregate = store.aggregates[id] ?? initialAggregate

      store.userRatings[id] = result.userRating
      store.aggregates[id] =
        result.previousRating !== null
          ? {
              sum: aggregate.sum - result.previousRating + result.userRating,
              count: aggregate.count,
            }
          : {
              sum: aggregate.sum + result.userRating,
              count: aggregate.count + 1,
            }
      writeStore(store)

      return result
    },
  }
}
