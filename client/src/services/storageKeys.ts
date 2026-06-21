export const STORAGE_KEYS = {
  moduleCards: (moduleId: string) => `flashcards:cards:${moduleId}`,
  examPlan: 'flashcards:exam-plan',
  userModules: 'flashcards:user-modules',
  userDiagrams: 'flashcards:user-diagrams',
  moduleFavorites: 'flashcards:module-favorites',
  diagramFavorites: 'flashcards:diagram-favorites',
  moduleRatings: 'flashcards:module-ratings',
  diagramRatings: 'flashcards:diagram-ratings',
  generationQuota: 'flashcards:ai-generation-quota',
  reviewDaily: 'flashcards-daily-review',
} as const
