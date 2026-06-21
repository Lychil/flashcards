import { STORAGE_KEYS } from './storageKeys'

const SEED_FAVORITE_DIAGRAM_IDS = ['1']

function mergeSeedIds(ids: string[]): string[] {
  return Array.from(new Set([...SEED_FAVORITE_DIAGRAM_IDS, ...ids]))
}

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.diagramFavorites)
    if (!raw) return SEED_FAVORITE_DIAGRAM_IDS
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? mergeSeedIds(parsed.filter((id): id is string => typeof id === 'string'))
      : SEED_FAVORITE_DIAGRAM_IDS
  } catch {
    return SEED_FAVORITE_DIAGRAM_IDS
  }
}

function writeIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEYS.diagramFavorites, JSON.stringify(ids))
}

export const diagramFavoritesRepository = {
  loadAll(): string[] {
    return readIds()
  },

  isFavorited(diagramId: string): boolean {
    return readIds().includes(diagramId)
  },

  toggle(diagramId: string): boolean {
    const ids = readIds()
    const index = ids.indexOf(diagramId)
    if (index >= 0) {
      writeIds(ids.filter((id) => id !== diagramId))
      return false
    }

    writeIds([...ids, diagramId])
    return true
  },
}
