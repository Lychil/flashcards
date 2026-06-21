export type ModuleType = 'text' | 'interactive'

/** public — открыт для всех, private — закрыт (только автор) */
export type ModuleVisibility = 'public' | 'private'

/** Целевая аудитория для глобального каталога */
export type ModuleTrack = 'ege' | 'university' | 'medicine' | 'school' | 'languages' | 'profession'

export interface ModuleAuthor {
  id: string
  name: string
  avatarUrl?: string
}

export interface Module {
  id: string
  title: string
  description: string
  previewWords: string[]
  wordCount: number
  category: string
  /** Подборка в глобальном каталоге: ЕГЭ, вуз, медики… */
  track?: ModuleTrack
  progress: number
  type: ModuleType
  color?: string
  folderId?: string
  author: ModuleAuthor
  /** По умолчанию public */
  visibility?: ModuleVisibility
  /** Ссылка на оригинал — копия в библиотеке пользователя */
  sourceModuleId?: string
  favoriteCount: number
  rating: number
  lastReviewedAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  avatarUrl?: string
  isPremium?: boolean
}
