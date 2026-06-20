import { STORAGE_KEYS } from './storageKeys'

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.moduleFavorites)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
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
