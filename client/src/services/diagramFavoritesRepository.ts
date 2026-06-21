import { STORAGE_KEYS } from './storageKeys'
import { createIdListRepository } from './storageUtils'

const SEED_FAVORITE_DIAGRAM_IDS = ['1']

export const diagramFavoritesRepository = createIdListRepository(
  STORAGE_KEYS.diagramFavorites,
  SEED_FAVORITE_DIAGRAM_IDS,
)
