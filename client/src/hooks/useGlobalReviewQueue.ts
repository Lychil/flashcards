import { useMemo } from 'react'
import { loadAllModuleCards } from '../hooks/useModuleCards'
import { buildReviewQueue } from '../lib/reviewQueue'
import { getFlashcardsForModule } from '../lib/mockFlashcards'
import { mockModules } from '../store/api/modulesApi'
import { userModuleRepository } from '../services/userModuleRepository'
import type { Module } from '../types/module'

function getAllModules(): Module[] {
  const userModules = userModuleRepository.loadAll()
  const userIds = new Set(userModules.map((m) => m.id))
  return [...userModules, ...mockModules.filter((m) => !userIds.has(m.id))]
}

function getSeedCards(moduleId: string, module: Module | undefined): import('../types/flashcard').Flashcard[] {
  if (!module) return []
  if (module.wordCount === 0) {
    const persisted = loadAllModuleCards([moduleId], () => [])[moduleId]
    return persisted ?? []
  }
  return getFlashcardsForModule(moduleId, module.previewWords)
}

export function useGlobalReviewQueue() {
  return useMemo(() => {
    const modules = getAllModules()
    const cardsByModule: Record<string, import('../types/flashcard').Flashcard[]> = {}

    for (const mod of modules) {
      if (mod.wordCount === 0) {
        cardsByModule[mod.id] = loadAllModuleCards([mod.id], () => [])[mod.id] ?? []
      } else {
        const seed = getFlashcardsForModule(mod.id, mod.previewWords)
        cardsByModule[mod.id] = loadAllModuleCards([mod.id], () => seed)[mod.id]
      }
    }

    const queue = buildReviewQueue(modules.filter((m) => (cardsByModule[m.id]?.length ?? 0) > 0), cardsByModule)

    return { queue, modules, cardsByModule }
  }, [])
}

export function useAllModulesCards() {
  return useMemo(() => {
    const modules = getAllModules()
    const cardsByModule: Record<string, import('../types/flashcard').Flashcard[]> = {}

    for (const mod of modules) {
      const seed =
        mod.wordCount > 0 ? getFlashcardsForModule(mod.id, mod.previewWords) : []
      cardsByModule[mod.id] = loadAllModuleCards([mod.id], () => seed)[mod.id]
    }

    return { modules, cardsByModule }
  }, [])
}

export { getAllModules, getSeedCards }
