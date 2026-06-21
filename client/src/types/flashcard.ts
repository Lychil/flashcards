import type { SourceReference } from './aiGeneration'
import type { CardSrsData, CardSrsChoice } from './srs'

export type CardFilter = 'all' | CardSrsChoice

export interface Flashcard {
  id: string
  term: string
  definition: string
  srs?: CardSrsData
  sourceRef?: SourceReference
}
