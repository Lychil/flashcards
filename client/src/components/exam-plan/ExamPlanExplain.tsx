import { HelpCircle, X } from 'lucide-react'
import { useState } from 'react'
import {
  PLAN_EXPLANATION,
  PLAN_ICON_LABELS,
  planBodyClass,
  planCaptionClass,
  planOnboardingActionClass,
  planSubsectionTitleClass,
} from './examPlanStyles'

const EXPLAIN_DETAILS = [
  {
    term: 'Откуда цифры в календаре',
    text: 'Мы знаем дату экзамена, состав модулей и статус каждой карточки — новая она или уже пройденная. Алгоритм повторений подсказывает, когда к карточке стоит вернуться. Дальше мы складываем созревшие повторы и порцию новых карточек так, чтобы весь объём равномерно разошёлся по оставшимся дням.',
  },
  {
    term: PLAN_ICON_LABELS.firstStudy,
    text: 'Карточки, которые вы пока ни разу не открывали. План добавляет их понемногу каждый день, чтобы не наваливать всё сразу.',
  },
  {
    term: PLAN_ICON_LABELS.reviewDue,
    text: 'Карточки, которые вы уже проходили и которым подошёл срок повторения. Если вчера позаниматься не получилось, сегодня их накопится чуть больше.',
  },
  {
    term: 'Прогноз справа',
    text: 'Показывает, насколько уверенно вы, скорее всего, будете помнить материал в день экзамена, если заниматься по плану каждый день. Когда вы отстаёте, цифра снижается и появляется предупреждение.',
  },
] as const

export function ExamPlanExplain() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={planOnboardingActionClass}
        aria-label="Как составлен план"
      >
        <HelpCircle size={15} strokeWidth={2} />
        Как составлен план
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[min(90vh,880px)] w-full max-w-3xl overflow-y-auto rounded-[22px] border border-border bg-white p-5 sm:p-6 lg:max-w-4xl lg:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className={planSubsectionTitleClass}>Как составлен план</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">
                <X size={18} strokeWidth={2} className="text-text-tertiary" />
              </button>
            </div>
            <p className={`max-w-none ${planBodyClass}`}>{PLAN_EXPLANATION}</p>
            <ul className={`mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-8 lg:gap-y-5 ${planCaptionClass}`}>
              {EXPLAIN_DETAILS.map((item) => (
                <li key={item.term} className="min-w-0">
                  <span className="font-medium text-text-primary">{item.term}.</span>{' '}
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
