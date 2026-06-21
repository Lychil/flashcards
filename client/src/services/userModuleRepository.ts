import type { Module } from '../types/module'
import { STORAGE_KEYS } from './storageKeys'

export interface UserModuleRepository {
  loadAll(): Module[]
  save(module: Module): void
  remove(moduleId: string): void
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

export const userModuleRepository: UserModuleRepository = {
  loadAll() {
    return readJson<Module[]>(STORAGE_KEYS.userModules) ?? []
  },

  save(module) {
    const existing = readJson<Module[]>(STORAGE_KEYS.userModules) ?? []
    const index = existing.findIndex((m) => m.id === module.id)
    const next =
      index >= 0
        ? existing.map((m, i) => (i === index ? module : m))
        : [...existing, module]
    localStorage.setItem(STORAGE_KEYS.userModules, JSON.stringify(next))
  },

  remove(moduleId) {
    const existing = readJson<Module[]>(STORAGE_KEYS.userModules) ?? []
    localStorage.setItem(
      STORAGE_KEYS.userModules,
      JSON.stringify(existing.filter((m) => m.id !== moduleId)),
    )
  },
}
