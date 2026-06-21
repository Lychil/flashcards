export const DEFAULT_PLAN_TARGET_READINESS_PERCENT = 90

export interface ExamPlan {
  examDate: string
  moduleIds: string[]
  createdAt: number
  /** User-facing name for what they are preparing for */
  goalTitle?: string
  /** Target mastery % by exam date */
  targetReadinessPercent?: number
  /** ISO date (YYYY-MM-DD) → cards reviewed that day */
  dailyReviews: Record<string, number>
  /** ISO date (YYYY-MM-DD) → new cards introduced that day */
  dailyNewCards: Record<string, number>
  /** Demo seed in localStorage — exam date kept within MOCK_EXAM_DAYS_AHEAD */
  isMock?: boolean
  schemaVersion?: number
  /** Set when user explicitly saves the plan — skips auto demo shortening */
  userConfirmed?: boolean
}

export interface DailyPlan {
  newCardsPerDay: number
  reviewsPerDay: number
}

export interface ExamPlanForecast {
  predictedReadinessPercent: number
  /** Current mastery right now */
  currentReadinessPercent: number
  targetReadinessPercent: number
  daysRemaining: number
  totalCards: number
  masteredCards: number
  dueToday: number
  newRemaining: number
  dailyPlan: DailyPlan
  isBehindSchedule: boolean
  behindMessage?: string
  extraCardsPerDay?: number
  daysBehind?: number
  scheduleLagCards?: number
  /** Unified today load: new + reviews planned for today (same number as on home) */
  todayLoad: number
}

export type PlanDayStatus =
  | 'past-done'
  | 'past-partial'
  | 'past-missed'
  | 'today'
  | 'future'
  | 'exam'

export interface PlanDayEntry {
  date: string
  plannedNew: number
  plannedReviews: number
  actualNew: number
  actualReviews: number
  totalPlanned: number
  totalActual: number
  status: PlanDayStatus
  isOverloaded: boolean
  readinessPercent: number
  /** Оставшиеся новые/повторы в очереди (для ячейки «сегодня» в календаре). */
  remainingNew?: number
  remainingReviews?: number
  moduleBreakdown?: { moduleId: string; title: string; new: number; reviews: number }[]
}

export interface ReadinessPoint {
  date: string
  percent: number
  isAdjusted: boolean
}

export interface ExamPlanSchedule {
  days: PlanDayEntry[]
  todayEntry: PlanDayEntry | null
  todayLoad: number
  forecast: ExamPlanForecast
  readinessCurve: ReadinessPoint[]
  weeks: PlanCalendarWeek[]
  /** Inclusive calendar range: from today to exam date */
  calendarFrom: string
  calendarTo: string
}

export interface PlanCalendarDay {
  date: string
  entry: PlanDayEntry | null
  /** Before today or after exam — outside active plan window */
  isOutsideRange: boolean
  /** Padding cell from adjacent month in month view */
  isOutsideMonth?: boolean
}

export type PlanCalendarWeek = PlanCalendarDay[]
