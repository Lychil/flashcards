import type { Flashcard } from '../types/flashcard'
import { STORAGE_KEYS } from './storageKeys'

export interface CardRepository {
  loadCards(moduleId: string): Flashcard[] | null
  saveCards(moduleId: string, cards: Flashcard[]): void
  clearCards(moduleId: string): void
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const cardRepository: CardRepository = {
  loadCards(moduleId) {
    return readJson<Flashcard[]>(STORAGE_KEYS.moduleCards(moduleId))
  },

  saveCards(moduleId, cards) {
    writeJson(STORAGE_KEYS.moduleCards(moduleId), cards)
  },

  clearCards(moduleId) {
    localStorage.removeItem(STORAGE_KEYS.moduleCards(moduleId))
  },
}
