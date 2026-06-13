export type SrsRating = 'again' | 'hard' | 'good' | 'easy'

export type CardSrsChoice = 'know' | 'repeat' | 'dont_know'

export type SrsVisualStatus = 'due' | 'learning' | 'review' | 'mature'

export interface CardSrsData {
  repetitions: number
  easeFactor: number
  intervalMs: number
  nextReviewAt: number
  lastReviewedAt?: number
}

export interface ModuleStudyActivity {
  reviewsByDate: Record<string, number>
}
