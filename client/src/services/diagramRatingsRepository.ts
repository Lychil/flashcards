import { STORAGE_KEYS } from './storageKeys'
import { createRatingsRepository } from './storageUtils'

const ratingsRepository = createRatingsRepository(STORAGE_KEYS.diagramRatings)

export const diagramRatingsRepository = {
  loadUserRatings(): Record<string, number> {
    return ratingsRepository.loadUserRatings()
  },

  getUserRating(diagramId: string): number | null {
    return ratingsRepository.getUserRating(diagramId)
  },

  getAverageRating(diagramId: string): number {
    return ratingsRepository.getAverageRating(diagramId)
  },

  rate(diagramId: string, stars: number): { averageRating: number; userRating: number } {
    return ratingsRepository.rate(diagramId, stars)
  },
}
