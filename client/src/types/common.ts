export interface Author {
  id: string
  name: string
  avatarUrl?: string
}

export interface User extends Author {
  isPremium?: boolean
}

export interface RatingAggregate {
  sum: number
  count: number
}

export interface RatingsStore {
  userRatings: Record<string, number>
  aggregates: Record<string, RatingAggregate>
}
