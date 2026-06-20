import type { Module } from '../types/module'
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
    const raw = localStorage.getItem(STORAGE_KEYS.moduleRatings)
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
  localStorage.setItem(STORAGE_KEYS.moduleRatings, JSON.stringify(store))
}

function initAggregate(module: Module): RatingAggregate {
  if (module.rating > 0) {
    const count = Math.max(Math.round(module.favoriteCount / 80), 8)
    return { sum: module.rating * count, count }
  }
  return { sum: 0, count: 0 }
}

function computeAverage(
  moduleId: string,
  stars: number,
  module: Module,
): { averageRating: number; userRating: number } {
  const rating = Math.min(5, Math.max(1, Math.round(stars)))
  const store = readStore()
  const previousRating = store.userRatings[moduleId] ?? null
  let aggregate = store.aggregates[moduleId] ?? initAggregate(module)

  if (previousRating !== null) {
    aggregate = { sum: aggregate.sum - previousRating + rating, count: aggregate.count }
  } else {
    aggregate = { sum: aggregate.sum + rating, count: aggregate.count + 1 }
  }

  const averageRating =
    aggregate.count > 0 ? Math.round((aggregate.sum / aggregate.count) * 10) / 10 : 0

  return { averageRating, userRating: rating }
}

export const moduleRatingsRepository = {
  loadUserRatings(): Record<string, number> {
    return readStore().userRatings
  },

  getUserRating(moduleId: string): number | null {
    return readStore().userRatings[moduleId] ?? null
  },

  previewRate(
    moduleId: string,
    stars: number,
    module: Module,
  ): { averageRating: number; userRating: number } {
    return computeAverage(moduleId, stars, module)
  },

  rate(
    moduleId: string,
    stars: number,
    module: Module,
  ): { averageRating: number; userRating: number; previousRating: number | null } {
    const rating = Math.min(5, Math.max(1, Math.round(stars)))
    const store = readStore()
    const previousRating = store.userRatings[moduleId] ?? null
    let aggregate = store.aggregates[moduleId] ?? initAggregate(module)

    if (previousRating !== null) {
      aggregate = { sum: aggregate.sum - previousRating + rating, count: aggregate.count }
    } else {
      aggregate = { sum: aggregate.sum + rating, count: aggregate.count + 1 }
    }

    store.userRatings[moduleId] = rating
    store.aggregates[moduleId] = aggregate
    writeStore(store)

    const averageRating =
      aggregate.count > 0 ? Math.round((aggregate.sum / aggregate.count) * 10) / 10 : 0

    return { averageRating, userRating: rating, previousRating }
  },
}
