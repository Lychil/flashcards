import type { GenerationQuota } from '../types/aiGeneration'
import { STORAGE_KEYS } from './storageKeys'

const DEFAULT_LIMIT = 5

export interface GenerationQuotaRepository {
  load(): GenerationQuota
  incrementUsed(): GenerationQuota
  reset(): void
}

function readQuota(): GenerationQuota {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.generationQuota)
    if (raw) return JSON.parse(raw) as GenerationQuota
  } catch {
    /* ignore */
  }
  return { used: 0, limit: DEFAULT_LIMIT }
}

export const generationQuotaRepository: GenerationQuotaRepository = {
  load() {
    return readQuota()
  },

  incrementUsed() {
    const current = readQuota()
    const next = { ...current, used: current.used + 1 }
    localStorage.setItem(STORAGE_KEYS.generationQuota, JSON.stringify(next))
    return next
  },

  reset() {
    localStorage.setItem(
      STORAGE_KEYS.generationQuota,
      JSON.stringify({ used: 0, limit: DEFAULT_LIMIT }),
    )
  },
}
