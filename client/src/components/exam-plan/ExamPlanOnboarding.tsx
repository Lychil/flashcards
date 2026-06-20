import { List, X } from 'lucide-react'
import { useState } from 'react'
import {
  planBodyClass,
  planCaptionClass,
  planLabelClass,
  planOnboardingActionClass,
  planSectionTitleClass,
  planSubsectionTitleClass,
} from './examPlanStyles'
import { ExamPlanExplain } from './ExamPlanExplain'

interface ExamPlanOnboardingProps {
  variant: 'setup' | 'active'
}

const INTRO = {
  setup:
    'Нажмите «Настроить план», укажите дату экзамена и модули — после сохранения здесь появится календарь. В каждой ячейке будет написано, сколько карточек пройти в этот день: часть впервые, часть на повтор. Так весь материал из выбранных модулей разложится по дням до экзамена, без «выучить всё за ночь».',
  active: [
    'В календаре уже стоят цифры — это ваш график до экзамена. Мы взяли все карточки из выбранных модулей, учли, что вы уже проходили, и разбили остальное по дням.',
    'В ячейке два числа: ✦ — сколько открыть впервые, ↺ — сколько повторить. Если делать примерно столько, как написано, вы успеете пройти материал к экзамену. Сегодня — ячейка с кнопкой «Начать»: это ваша норма на день. Пропустили — нагрузка съезжает на следующие дни, и справа будет видно отставание.',
  ],
} as const

const STEPS = {
  setup: [
    {
      title: 'Выберите дату и модули',
      text: 'Нажмите «Настроить план» — укажите дату экзамена и модули для подготовки.',
    },
    {
      title: 'Сохраните',
      text: 'Появится календарь с цифрами по дням — это и есть план.',
    },
    {
      title: 'Занимайтесь по ячейкам',
      text: 'Каждый день — столько карточек, сколько в этот день написано.',
    },
  ],
  active: [
    {
      title: 'Читайте ячейку',
      text: '✦ — новые карточки, ↺ — те, что пора вспомнить снова. Нажмите на день — увидите разбивку по модулям.',
    },
    {
      title: 'Начните с сегодня',
      text: 'Кнопка «Начать» в сегодняшней ячейке откроет сессию ровно с тем, что запланировано.',
    },
    {
      title: 'Смотрите справа',
      text: 'Там — сколько дней до экзамена и успеваете ли вы, если будете идти по плану.',
    },
  ],
} as const

export function ExamPlanOnboarding({ variant }: ExamPlanOnboardingProps) {
  const [stepsOpen, setStepsOpen] = useState(false)
  const steps = STEPS[variant]
  const intro = INTRO[variant]

  return (
    <section className="mb-5 w-full max-w-none" aria-label="О плане подготовки">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className={planSectionTitleClass}>Что вы видите на этой странице</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStepsOpen(true)}
            className={planOnboardingActionClass}
            aria-label="С чего начать"
          >
            <List size={15} strokeWidth={2} />
            С чего начать
          </button>
          <ExamPlanExplain />
        </div>
      </div>

      <div className={`mt-2 w-full space-y-2 ${planBodyClass}`}>
        {Array.isArray(intro) ? (
          intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p>{intro}</p>
        )}
      </div>

      {stepsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 sm:items-center sm:p-6"
          onClick={() => setStepsOpen(false)}
        >
          <div
            className="max-h-[min(90vh,880px)] w-full max-w-3xl overflow-y-auto rounded-[22px] border border-border bg-white p-5 sm:p-6 lg:max-w-4xl lg:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className={planSubsectionTitleClass}>С чего начать</h3>
              <button type="button" onClick={() => setStepsOpen(false)} aria-label="Закрыть">
                <X size={18} strokeWidth={2} className="text-text-tertiary" />
              </button>
            </div>
            <ol className="grid gap-5 sm:grid-cols-3 sm:gap-8">
              {steps.map((step, index) => (
                <li key={step.title} className="min-w-0">
                  <p className={`${planLabelClass} tabular-nums text-text-tertiary`}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className={`mt-1 ${planLabelClass} text-text-primary`}>{step.title}</p>
                  <p className={`mt-1 ${planCaptionClass}`}>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}
