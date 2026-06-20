import { loadModuleStudyActivity } from './moduleStudyActivity'

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function prevDayKey(key: string): string {
  const d = new Date(`${key}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

/** Aggregate review counts across modules by date */
export function aggregateReviewsByDate(moduleIds: string[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const id of moduleIds) {
    const activity = loadModuleStudyActivity(id)
    for (const [date, count] of Object.entries(activity.reviewsByDate)) {
      result[date] = (result[date] ?? 0) + count
    }
  }
  return result
}

/** Consecutive days with at least one review, ending today or yesterday */
export function computeReviewStreak(reviewsByDate: Record<string, number>): number {
  const today = todayKey()
  const yesterday = prevDayKey(today)

  let start = today
  if ((reviewsByDate[today] ?? 0) <= 0) {
    if ((reviewsByDate[yesterday] ?? 0) <= 0) return 0
    start = yesterday
  }

  let streak = 0
  let cursor = start
  while ((reviewsByDate[cursor] ?? 0) > 0) {
    streak += 1
    cursor = prevDayKey(cursor)
  }
  return streak
}
