import { filterGlobalModules } from './globalModules'
import type { Module } from '../types/module'

export function normalizeGlobalSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function matchesGlobalModule(module: Module, query: string): boolean {
  if (!query) return true
  return (
    module.title.toLowerCase().includes(query) ||
    module.category.toLowerCase().includes(query) ||
    module.description.toLowerCase().includes(query) ||
    module.author.name.toLowerCase().includes(query) ||
    module.previewWords.some((word) => word.toLowerCase().includes(query))
  )
}

export function searchGlobalModules(
  modules: Module[],
  currentUserId: string,
  query: string,
  limit?: number,
): Module[] {
  const normalized = normalizeGlobalSearchQuery(query)
  if (!normalized) return []

  const filtered = filterGlobalModules(modules, currentUserId).filter((module) =>
    matchesGlobalModule(module, normalized),
  )

  return limit != null ? filtered.slice(0, limit) : filtered
}
