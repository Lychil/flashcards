import { Link } from 'react-router-dom'
import { CalendarDays, Play } from 'lucide-react'
import { pluralizeRu } from '../../lib/pluralizeRu'
import { moduleGhostButtonClass, modulePrimaryButtonClass } from '../module/moduleStyles'
import { PLAN_PURPLE, planSurfaceClass } from '../exam-plan/examPlanStyles'

interface TodayReviewHeroProps {
  totalDue: number
  reviewCount: number
  newCount: number
  fromPlan?: boolean
  goalTitle?: string | null
}

const actionButtonClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold'

export function TodayReviewHero({
  totalDue,
  reviewCount,
  newCount,
  fromPlan,
  goalTitle,
}: TodayReviewHeroProps) {
  return (
    <div className={`${planSurfaceClass} flex w-full items-center border border-border`}>
      <div className="grid w-full gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0 self-center">
          {fromPlan && goalTitle && (
            <p className="mb-2 text-[15px] font-medium leading-snug text-text-primary">{goalTitle}</p>
          )}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[32px] font-semibold tabular-nums tracking-[-0.02em] text-text-primary">
              {totalDue}
            </span>
            {totalDue > 0 && (
              <span className="text-[14px] text-text-secondary">
                {reviewCount > 0 && (
                  <span>{reviewCount} {pluralizeRu(reviewCount, ['повтор', 'повтора', 'повторов'])}</span>
                )}
                {reviewCount > 0 && newCount > 0 && ' · '}
                {newCount > 0 && (
                  <span>{newCount} {pluralizeRu(newCount, ['новая', 'новые', 'новых'])}</span>
                )}
              </span>
            )}
          </div>
          {totalDue === 0 ? (
            <p className="mt-2 text-[14px] text-text-secondary">
              На сегодня всё повторено — созревших карточек нет. Загляните завтра.
            </p>
          ) : (
            <p className="mt-2 text-[14px] text-text-secondary">
              {fromPlan
                ? 'Только карточки, созревшие по FSRS, плюс новые в рамках дневного лимита — не вся колода.'
                : 'Сессия включает созревшие повторы и до 15 новых карточек в день.'}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col justify-center gap-2 self-center sm:w-auto sm:min-w-[15.5rem]">
          {totalDue > 0 && (
            <Link
              to="/review"
              className={[modulePrimaryButtonClass, actionButtonClass, 'text-white'].join(' ')}
              style={{ backgroundColor: PLAN_PURPLE }}
            >
              <Play size={16} strokeWidth={2.5} fill="currentColor" />
              Начать повторение
            </Link>
          )}
          <Link
            to="/plan"
            className={[moduleGhostButtonClass, actionButtonClass].join(' ')}
          >
            <CalendarDays size={16} strokeWidth={2} />
            {fromPlan ? 'Календарь плана' : 'План подготовки'}
          </Link>
        </div>
      </div>
    </div>
  )
}
