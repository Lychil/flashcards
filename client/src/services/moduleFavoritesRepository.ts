import { STORAGE_KEYS } from './storageKeys'
import { createIdListRepository } from './storageUtils'

const SEED_FAVORITE_MODULE_IDS = ['1']

export const moduleFavoritesRepository = createIdListRepository(
  STORAGE_KEYS.moduleFavorites,
  SEED_FAVORITE_MODULE_IDS,
)
