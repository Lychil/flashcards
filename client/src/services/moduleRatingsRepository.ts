import type { RatingAggregate } from '../types/common'
import type { Module } from '../types/module'
import { STORAGE_KEYS } from './storageKeys'
import { createRatingsRepository } from './storageUtils'

const ratingsRepository = createRatingsRepository(STORAGE_KEYS.moduleRatings)

function initAggregate(module: Module): RatingAggregate {
  if (module.rating > 0) {
    const count = Math.max(Math.round(module.favoriteCount / 80), 8)
    return { sum: module.rating * count, count }
  }
  return { sum: 0, count: 0 }
}

export const moduleRatingsRepository = {
  loadUserRatings(): Record<string, number> {
    return ratingsRepository.loadUserRatings()
  },

  getUserRating(moduleId: string): number | null {
    return ratingsRepository.getUserRating(moduleId)
  },

  previewRate(
    moduleId: string,
    stars: number,
    module: Module,
  ): { averageRating: number; userRating: number } {
    return ratingsRepository.previewRate(moduleId, stars, initAggregate(module))
  },

  rate(
    moduleId: string,
    stars: number,
    module: Module,
  ): { averageRating: number; userRating: number; previousRating: number | null } {
    return ratingsRepository.rate(moduleId, stars, initAggregate(module))
  },
}
