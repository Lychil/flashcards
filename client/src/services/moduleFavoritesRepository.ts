import { STORAGE_KEYS } from './storageKeys'

const SEED_FAVORITE_MODULE_IDS = ['1']

function mergeSeedIds(ids: string[]): string[] {
  return Array.from(new Set([...SEED_FAVORITE_MODULE_IDS, ...ids]))
}

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.moduleFavorites)
    if (!raw) return SEED_FAVORITE_MODULE_IDS
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? mergeSeedIds(parsed.filter((id): id is string => typeof id === 'string'))
      : SEED_FAVORITE_MODULE_IDS
  } catch {
    return SEED_FAVORITE_MODULE_IDS
  }
}

function writeIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEYS.moduleFavorites, JSON.stringify(ids))
}

export const moduleFavoritesRepository = {
  loadAll(): string[] {
    return readIds()
  },

  isFavorited(moduleId: string): boolean {
    return readIds().includes(moduleId)
  },

  toggle(moduleId: string): boolean {
    const ids = readIds()
    const index = ids.indexOf(moduleId)
    if (index >= 0) {
      writeIds(ids.filter((id) => id !== moduleId))
      return false
    }
    writeIds([...ids, moduleId])
    return true
  },
}
