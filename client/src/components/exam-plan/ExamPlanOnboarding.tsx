import { List, RotateCcw, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { moduleGhostButtonClass } from '../module/moduleStyles'
import { ModalOverlay } from '../ui/ModalOverlay'
import {
  PLAN_BLUE,
  PLAN_PURPLE,
  planBodyClass,
  planCaptionClass,
  planLabelClass,
} from './examPlanStyles'
import { ExamPlanExplain } from './ExamPlanExplain'

interface ExamPlanOnboardingProps {
  variant: 'setup' | 'active'
}

function PlanInlineIcon({ kind }: { kind: 'new' | 'review' }) {
  const Icon = kind === 'new' ? Sparkles : RotateCcw
  const color = kind === 'new' ? PLAN_PURPLE : PLAN_BLUE
  return (
    <Icon
      size={13}
      strokeWidth={1.75}
      className="inline shrink-0 align-[-0.15em]"
      style={{ color }}
      aria-hidden
    />
  )
}

const INTRO = {
  setup:
    'Нажмите «Настроить план», укажите дату экзамена и модули — после сохранения здесь появится календарь. В каждой ячейке будет написано, сколько карточек пройти в этот день: часть впервые, часть на повтор. Так весь материал из выбранных модулей разложится по дням до экзамена, без «выучить всё за ночь».',
  active: [
    'В календаре уже стоят цифры — это ваш график до экзамена. Мы взяли все карточки из выбранных модулей, учли, что вы уже проходили, и разбили остальное по дням.',
    <>
      В ячейке два числа: <PlanInlineIcon kind="new" /> — сколько открыть впервые,{' '}
      <PlanInlineIcon kind="review" /> — сколько повторить. Если делать примерно столько, как написано,
      вы успеете пройти материал к экзамену. Сегодня — ячейка с кнопкой «Начать»: это ваша норма на
      день. Пропустили — нагрузка съезжает на следующие дни, и справа будет видно отставание.
    </>,
  ] satisfies ReactNode[],
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
      text: (
        <>
          <PlanInlineIcon kind="new" /> — новые карточки, <PlanInlineIcon kind="review" /> — те, что пора
          вспомнить снова. Нажмите на день — увидите разбивку по модулям.
        </>
      ),
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
      <div className="flex flex-wrap items-center justify-start gap-2">
        <button
          type="button"
          onClick={() => setStepsOpen(true)}
          className={[moduleGhostButtonClass, 'border border-border'].join(' ')}
          aria-label="С чего начать"
        >
          <List size={15} strokeWidth={2} />
          С чего начать
        </button>
        <ExamPlanExplain />
      </div>

      <ModalOverlay open={stepsOpen} onClose={() => setStepsOpen(false)} title="С чего начать">
        <div className="mb-6 space-y-3">
          <h4 className={planLabelClass}>Что вы видите на этой странице</h4>
          <div className={`space-y-2 ${planBodyClass}`}>
            {Array.isArray(intro) ? (
              intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>{intro}</p>
            )}
          </div>
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
      </ModalOverlay>
    </section>
  )
}
