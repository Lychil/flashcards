import type { ModuleStudyActivity } from '../types/srs'

const STORAGE_PREFIX = 'flashcards-module-activity:'

function storageKey(moduleId: string) {
  return `${STORAGE_PREFIX}${moduleId}`
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function loadModuleStudyActivity(moduleId: string): ModuleStudyActivity {
  try {
    const raw = localStorage.getItem(storageKey(moduleId))
    if (!raw) return { reviewsByDate: {} }
    const parsed = JSON.parse(raw) as ModuleStudyActivity
    return { reviewsByDate: parsed.reviewsByDate ?? {} }
  } catch {
    return { reviewsByDate: {} }
  }
}

export function saveModuleStudyActivity(moduleId: string, activity: ModuleStudyActivity) {
  localStorage.setItem(storageKey(moduleId), JSON.stringify(activity))
}

export function recordCardReview(moduleId: string, count = 1): ModuleStudyActivity {
  const activity = loadModuleStudyActivity(moduleId)
  const key = todayKey()
  activity.reviewsByDate[key] = (activity.reviewsByDate[key] ?? 0) + count
  saveModuleStudyActivity(moduleId, activity)
  return activity
}

export function getStudyStreak(reviewsByDate: Record<string, number>, minReviews = 5): {
  current: number
  best: number
} {
  const activeDays = Object.entries(reviewsByDate)
    .filter(([, count]) => count >= minReviews)
    .map(([date]) => date)
    .sort()

  if (activeDays.length === 0) {
    return { current: 0, best: 0 }
  }

  let best = 0
  let run = 0
  let prev: Date | null = null

  for (const dateStr of activeDays) {
    const date = new Date(`${dateStr}T12:00:00`)
    if (prev) {
      const diffDays = Math.round((date.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000))
      run = diffDays === 1 ? run + 1 : 1
    } else {
      run = 1
    }
    best = Math.max(best, run)
    prev = date
  }

  let current = 0
  const today = todayKey()
  const yesterday = todayKey(new Date(Date.now() - 24 * 60 * 60 * 1000))

  if ((reviewsByDate[today] ?? 0) >= minReviews) {
    current = 1
    let cursor = yesterday
    while ((reviewsByDate[cursor] ?? 0) >= minReviews) {
      current += 1
      const d = new Date(`${cursor}T12:00:00`)
      d.setDate(d.getDate() - 1)
      cursor = todayKey(d)
    }
  } else if ((reviewsByDate[yesterday] ?? 0) >= minReviews) {
    current = 1
    let cursor = todayKey(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
    while ((reviewsByDate[cursor] ?? 0) >= minReviews) {
      current += 1
      const d = new Date(`${cursor}T12:00:00`)
      d.setDate(d.getDate() - 1)
      cursor = todayKey(d)
    }
  }

  return { current, best: Math.max(best, current) }
}

export function getRecentHeatmap(reviewsByDate: Record<string, number>, days = 28): {
  date: string
  count: number
}[] {
  const result: { date: string; count: number }[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const key = todayKey(d)
    result.push({ date: key, count: reviewsByDate[key] ?? 0 })
  }

  return result
}

export interface ContributionDay {
  date: string
  count: number
  isFuture: boolean
  isOutsideMonth?: boolean
}

export function getContributionWeeks(
  reviewsByDate: Record<string, number>,
  weekCount = 26,
  now = new Date(),
): ContributionDay[][] {
  const today = new Date(now)
  today.setHours(12, 0, 0, 0)
  const todayStr = todayKey(today)
  const mondayOffset = (today.getDay() + 6) % 7

  const startMonday = new Date(today)
  startMonday.setDate(today.getDate() - mondayOffset - (weekCount - 1) * 7)

  const weeks: ContributionDay[][] = []

  for (let w = 0; w < weekCount; w += 1) {
    const week: ContributionDay[] = []
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(startMonday)
      date.setDate(startMonday.getDate() + w * 7 + d)
      const key = todayKey(date)
      week.push({
        date: key,
        count: reviewsByDate[key] ?? 0,
        isFuture: key > todayStr,
      })
    }
    weeks.push(week)
  }

  return weeks
}

export function getCurrentMonthContributionWeeks(
  reviewsByDate: Record<string, number>,
  now = new Date(),
): ContributionDay[][] {
  const today = new Date(now)
  today.setHours(12, 0, 0, 0)
  const todayStr = todayKey(today)

  const year = today.getFullYear()
  const month = today.getMonth()

  const monthStart = new Date(year, month, 1, 12, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0, 12, 0, 0, 0)

  const gridStart = new Date(monthStart)
  gridStart.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7))

  const gridEnd = new Date(monthEnd)
  if (monthEnd.getDay() !== 0) {
    gridEnd.setDate(monthEnd.getDate() + ((7 - monthEnd.getDay()) % 7))
  }

  const weeks: ContributionDay[][] = []
  const weekStart = new Date(gridStart)

  while (weekStart <= gridEnd) {
    const week: ContributionDay[] = []

    for (let d = 0; d < 7; d += 1) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + d)
      const key = todayKey(date)
      const inMonth = date.getMonth() === month && date.getFullYear() === year

      week.push({
        date: key,
        count: inMonth ? (reviewsByDate[key] ?? 0) : 0,
        isFuture: inMonth && key > todayStr,
        isOutsideMonth: !inMonth,
      })
    }

    weeks.push(week)
    weekStart.setDate(weekStart.getDate() + 7)
  }

  return weeks
}

export function formatActivityMonth(date = new Date()): string {
  const label = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function getContributionLevel(count: number, maxCount: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (maxCount <= 1) return 4

  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

export function formatActivityDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
