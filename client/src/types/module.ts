export type ModuleType = 'text' | 'interactive'

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
  progress: number
  type: ModuleType
  color?: string
  folderId?: string
  author: ModuleAuthor
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
