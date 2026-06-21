/** Soft surfaces — padded card */
export const planSurfaceClass = 'rounded-[22px] bg-white px-5 py-5 sm:px-6'

/** Full-width plan blocks — flush with page title (no horizontal inset) */
export const planBlockClass = 'w-full max-w-none'

/** Page & section typography — aligned with Library / Home */
export const planPageTitleClass =
  'text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary sm:text-[32px]'

export const planSectionTitleClass =
  'text-[20px] font-semibold tracking-[-0.02em] text-text-primary'

export const planSubsectionTitleClass =
  'text-[16px] font-semibold text-text-primary'

export const planLabelClass = 'text-[15px] font-medium text-text-secondary'

export const planBodyClass = 'text-[15px] leading-relaxed text-text-secondary'

export const planCaptionClass = 'text-[14px] leading-relaxed text-text-tertiary'

export const planEyebrowClass =
  'text-[13px] font-medium uppercase tracking-[0.05em] text-text-tertiary'

/** Компактные кнопки-подсказки в шапке онбординга */
export const planOnboardingActionClass =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary'

export const PLAN_PURPLE = '#7F77DD'
export const PLAN_PURPLE_DARK = '#534AB7'
export const PLAN_GREEN = '#16a34a'
export const PLAN_AMBER = '#d97706'
export const PLAN_BLUE = '#5B9FD4'
export const PLAN_TEAL = '#14b8a6'

/** Мягкая палитра для sidebar-диаграмм (бары, donut, легенда) */
export const PLAN_CHART = {
  track: '#eceff4',
  forecast: '#9B93E6',
  current: '#6BC9A7',
  mastered: '#5DB892',
  review: '#7CB4E6',
  new: '#F0C468',
  positive: '#4A9B72',
  negative: '#D97A8F',
} as const

export const PLAN_CHART_TRACK_STYLE = {
  backgroundColor: PLAN_CHART.track,
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 8px, rgba(255,255,255,0.08) 8px 16px)',
} as const

/** Dashboard-style metric cards in the exam plan sidebar */
export const planMetricCardClass =
  'rounded-[18px] bg-surface-subtle px-4 py-4'

export function formatDayLoad(newCards: number, reviews: number): string {
  return `${newCards} впервые · ${reviews} на повтор`
}

export function estimateStudyMinutes(totalCards: number): number {
  return Math.max(5, Math.round(totalCards * 0.55))
}

export function formatExamSubtitle(moduleLabels: string[], examDate: string): string {
  const examLabel = new Date(`${examDate}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
  const modules =
    moduleLabels.length <= 2
      ? moduleLabels.join(', ')
      : `${moduleLabels[0]} +${moduleLabels.length - 1}`
  return `${modules} · экзамен ${examLabel}`
}

export const PLAN_EXPLANATION =
  'Вы указали дату экзамена и выбрали модули для подготовки. У каждой карточки своя история: либо вы её ещё не открывали, либо уже проходили и теперь подошёл срок повторить. Каждый день мы подсчитываем, сколько карточек созрело для повторения и сколько новых можно добавить без перегруза, а затем распределяем весь объём по дням, которые остались до экзамена. Так и получаются цифры в календаре — за ними стоит расчёт всего материала по датам.'

export const PLAN_TARGET_PERCENT = 90

/** Подписи к иконкам в календаре и карточках */
export const PLAN_ICON_LABELS = {
  firstStudy: 'Ещё не проходили',
  firstStudyCount: 'впервые',
  reviewDue: 'Уже учили — повтор',
  reviewDueCount: 'на повтор',
} as const

/** Легенда фона ячеек календаря */
export const CALENDAR_DAY_LEGEND = [
  { color: '#f5f3ff', label: 'Сегодня' },
  { color: '#ecfdf3', label: 'Выполнено' },
  { color: '#fffbeb', label: 'Пропущено или частично' },
  { color: '#fdf2f8', label: 'Догоняем пропущенное' },
  { color: '#ffffff', label: 'Запланировано', bordered: true },
  { color: '#f4f5f7', label: 'Прошло', muted: true },
] as const

export const LABELS = {
  readinessForecast:
    'Насколько хорошо вы, по нашим расчётам, будете помнить материал в день экзамена, если каждый день выполнять план.',
  currentReadiness:
    'Насколько хорошо материал держится в памяти прямо сейчас — по всем карточкам из выбранных модулей.',
  mastered:
    'Карточки, которые вы уже хорошо знаете: вероятность вспомнить их не ниже 90%.',
  readiness:
    'Вероятность вспомнить материал к экзамену, если следовать плану каждый день.',
  todayNew:
    'Карточки, которые вы ещё ни разу не открывали и не проходили. План равномерно разносит их по оставшимся дням до экзамена.',
  todayReviews:
    'Карточки, которые вы уже проходили и которым подошёл срок повторения. Если вчера что-то не успели, оно добавится сюда.',
  dayLoad: 'Сколько карточек запланировано на этот день: впервые плюс на повтор.',
  newRemaining: 'Карточки, которые вы ещё ни разу не проходили.',
  newDailyLimit: 'В один день нельзя проходить слишком много карточек впервые — так материал лучше запоминается.',
} as const
