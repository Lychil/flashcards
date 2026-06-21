import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { moduleGhostButtonClass } from '../module/moduleStyles'
import { ModalOverlay } from '../ui/ModalOverlay'
import {
  PLAN_EXPLANATION,
  PLAN_ICON_LABELS,
  planBodyClass,
  planCaptionClass,
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
        className={[moduleGhostButtonClass, 'border border-border'].join(' ')}
        aria-label="Как составлен план"
      >
        <HelpCircle size={15} strokeWidth={2} />
        Как составлен план
      </button>

      <ModalOverlay open={open} onClose={() => setOpen(false)} title="Как составлен план">
        <p className={`max-w-none ${planBodyClass}`}>{PLAN_EXPLANATION}</p>
        <ul className={`mt-5 grid gap-4 sm:grid-cols-2 sm:gap-x-8 lg:gap-y-5 ${planCaptionClass}`}>
          {EXPLAIN_DETAILS.map((item) => (
            <li key={item.term} className="min-w-0">
              <span className="font-medium text-text-primary">{item.term}.</span> {item.text}
            </li>
          ))}
        </ul>
      </ModalOverlay>
    </>
  )
}
