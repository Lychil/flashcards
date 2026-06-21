export type SourceType = 'text' | 'file' | 'url'

export interface SourceReference {
  excerpt: string
  startOffset?: number
  endOffset?: number
  sourceType: SourceType
  sourceLabel: string
}

export type GeneratedCardStatus = 'pending' | 'accepted' | 'rejected'

export interface GeneratedCard {
  id: string
  term: string
  definition: string
  sourceRef: SourceReference
  status: GeneratedCardStatus
}

export interface AiGenerationInput {
  text?: string
  fileName?: string
  fileContent?: string
  url?: string
}

export type AiGenerationPhase = 'idle' | 'generating' | 'done' | 'error' | 'empty'

export interface GenerationQuota {
  used: number
  limit: number
}
