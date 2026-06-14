import { getModuleSrsStats } from './spacedRepetition'
import type { Flashcard } from '../types/flashcard'

export interface ModuleStudyStats {
  progressPercent: number
}

export function getModuleStudyStats(cards: Flashcard[], now = Date.now()): ModuleStudyStats {
  const srsStats = getModuleSrsStats(cards, now)

  return {
    progressPercent: srsStats.masteryPercent,
  }
}
