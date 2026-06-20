export const STORAGE_KEYS = {
  moduleCards: (moduleId: string) => `flashcards:cards:${moduleId}`,
  examPlan: 'flashcards:exam-plan',
  userModules: 'flashcards:user-modules',
  moduleFavorites: 'flashcards:module-favorites',
  moduleRatings: 'flashcards:module-ratings',
  generationQuota: 'flashcards:ai-generation-quota',
} as const
