export type SrsRating = 'again' | 'hard' | 'good' | 'easy'

export type CardSrsChoice = 'know' | 'repeat' | 'dont_know'

export type SrsVisualStatus = 'due' | 'learning' | 'review' | 'mature'

/** FSRS card state persisted in localStorage (v2) */
export interface CardSrsData {
  v: 2
  due: number
  stability: number
  difficulty: number
  scheduledDays: number
  reps: number
  lapses: number
  /** 0=New, 1=Learning, 2=Review, 3=Relearning */
  state: 0 | 1 | 2 | 3
  lastReview?: number
  learningSteps: number
}

export type CardDifficultyLevel = 'easy' | 'medium' | 'hard' | 'very_hard'

export interface ModuleStudyActivity {
  reviewsByDate: Record<string, number>
}
