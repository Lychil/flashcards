import { Check, RotateCcw, X } from 'lucide-react'
import { compareSpelling } from '../../../lib/spellingDiff'
import { pluralizeRu } from '../../../lib/pluralizeRu'
import { statsCaptionClass, statsCardShellClass, statsLabelClass, statsMetricClass } from '../../stats/statsStyles'
import { moduleGhostButtonClass } from '../moduleStyles'

export interface TestAnswerReview {
  cardId?: string
  prompt: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  reviewVariant?: 'default' | 'spelling'
}

interface StudyTestResultsProps {
  title: string
  answers: TestAnswerReview[]
  accentColor?: string
  detail?: string
  onRestart: () => void
}

function scoreMessage(percent: number): string {
  if (percent === 100) return 'Идеально!'
  if (percent >= 80) return 'Отлично!'
  if (percent >= 60) return 'Неплохо'
  if (percent >= 40) return 'Можно лучше'
  return 'Попробуйте снова'
}

function scoreHint(percent: number): string {
  if (percent === 100) return 'Все ответы верные — так держать'
  if (percent >= 80) return 'Почти всё получилось'
  if (percent >= 60) return 'Хорошая база, есть куда расти'
  if (percent >= 40) return 'Повторите сложные карточки'
  return 'Не расстраивайтесь — практика поможет'
}

function ProgressRing({ value, accentColor }: { value: number; accentColor: string }) {
  const box = 124
  const radius = 48
  const stroke = 9
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const center = box / 2

  return (
    <div className="relative h-[108px] w-[108px] shrink-0 sm:h-[124px] sm:w-[124px]">
      <svg viewBox={`0 0 ${box} ${box}`} className="h-full w-full -rotate-90" aria-hidden>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#eef0f4" strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-bold tabular-nums tracking-[-0.04em] text-text-primary sm:text-[26px]">
          {value}%
        </span>
      </div>
    </div>
  )
}

function SpellingAnswerLarge({
  userAnswer,
  correctAnswer,
  isCorrect,
}: {
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
}) {
  const letters = compareSpelling(userAnswer, correctAnswer)

  return (
    <div className="mt-3">
      <p className="mb-2 text-[12px] font-medium text-text-secondary">Ваш ответ</p>
      <div className="flex flex-wrap gap-1.5">
        {letters.length === 0 ? (
          <span className="text-[13px] text-text-tertiary">—</span>
        ) : (
          letters.map((letter, letterIndex) => (
            <span
              key={`${letterIndex}-${letter.char}`}
              className={[
                'flex h-11 min-w-[2.75rem] items-center justify-center rounded-xl px-2 text-[20px] font-semibold uppercase sm:h-12 sm:min-w-[3rem] sm:text-[22px]',
                letter.status === 'correct'
                  ? 'bg-[#6BC9A7]/15 text-[#2d8a66]'
                  : 'bg-[#E879A9]/15 text-[#b04472]',
              ].join(' ')}
            >
              {letter.char}
            </span>
          ))
        )}
      </div>

      {!isCorrect && (
        <>
          <p className="mb-2 mt-4 text-[12px] font-medium text-text-secondary">Правильно</p>
          <p className="text-[26px] font-bold leading-none tracking-[-0.02em] text-[#2d8a66] sm:text-[30px]">
            {correctAnswer}
          </p>
        </>
      )}
    </div>
  )
}

function ReviewItem({ answer, index }: { answer: TestAnswerReview; index: number }) {
  const isCorrect = answer.isCorrect
  const useSpelling = answer.reviewVariant === 'spelling'

  return (
    <li
      className={[
        'rounded-[18px] border px-4 py-3.5 sm:px-5',
        isCorrect
          ? 'border-[#6BC9A7]/30 bg-[#6BC9A7]/5'
          : 'border-[#E879A9]/30 bg-[#E879A9]/5',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
            isCorrect ? 'bg-[#6BC9A7]/15 text-[#2d8a66]' : 'bg-[#E879A9]/15 text-[#b04472]',
          ].join(' ')}
          aria-hidden
        >
          {isCorrect ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-semibold tabular-nums text-text-tertiary">
              {index + 1}
            </span>
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                isCorrect
                  ? 'bg-[#6BC9A7]/15 text-[#2d8a66]'
                  : 'bg-[#E879A9]/15 text-[#b04472]',
              ].join(' ')}
            >
              {isCorrect ? 'Верно' : 'Ошибка'}
            </span>
          </div>

          <p className="text-[14px] leading-relaxed text-text-primary">{answer.prompt}</p>

          {useSpelling ? (
            <SpellingAnswerLarge
              userAnswer={answer.userAnswer}
              correctAnswer={answer.correctAnswer}
              isCorrect={isCorrect}
            />
          ) : isCorrect ? (
            <p className="mt-2 text-[13px] font-medium text-[#2d8a66]">{answer.correctAnswer}</p>
          ) : (
            <div className="mt-2 space-y-1 text-[13px]">
              <p className="text-text-secondary">
                Ваш ответ:{' '}
                <span className="font-medium text-[#b04472]">{answer.userAnswer || '—'}</span>
              </p>
              <p className="text-text-secondary">
                Правильно:{' '}
                <span className="font-medium text-[#2d8a66]">{answer.correctAnswer}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export function StudyTestResults({
  title,
  answers,
  accentColor = '#6366f1',
  detail,
  onRestart,
}: StudyTestResultsProps) {
  const correctCount = answers.filter((a) => a.isCorrect).length
  const total = answers.length
  const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100)
  const wrongCount = total - correctCount

  return (
    <div className="space-y-4">
      <article
        className="relative overflow-hidden rounded-[22px] border border-border bg-white px-5 py-6 sm:px-7 sm:py-7"
        style={{
          backgroundImage: `linear-gradient(135deg, ${accentColor}10 0%, #ffffff 42%, #ffffff 100%)`,
        }}
      >
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-60 blur-2xl"
          style={{ backgroundColor: `${accentColor}18` }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
          <ProgressRing value={percent} accentColor={accentColor} />

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className={statsLabelClass}>{title}</p>
            <h3 className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-text-primary sm:text-[28px]">
              {scoreMessage(percent)}
            </h3>
            <p className="mt-1 text-[14px] text-text-secondary">{scoreHint(percent)}</p>
            {detail && <p className="mt-2 text-[13px] text-text-tertiary">{detail}</p>}
          </div>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-3">
        <article className={`${statsCardShellClass} min-h-[96px]`}>
          <p className={statsLabelClass}>Верно</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className={`${statsMetricClass} text-[#2d8a66]`}>{correctCount}</span>
            <span className={statsCaptionClass}>из {total}</span>
          </p>
        </article>
        <article className={`${statsCardShellClass} min-h-[96px]`}>
          <p className={statsLabelClass}>Ошибки</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className={`${statsMetricClass} ${wrongCount > 0 ? 'text-[#b04472]' : ''}`}>
              {wrongCount}
            </span>
            <span className={statsCaptionClass}>
              {pluralizeRu(wrongCount, ['ошибка', 'ошибки', 'ошибок'])}
            </span>
          </p>
        </article>
      </div>

      <section className="space-y-3">
        <div className="px-1">
          <h4 className="text-[16px] font-semibold tracking-[-0.02em] text-text-primary">
            Все задания
          </h4>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            {total} {pluralizeRu(total, ['задание', 'задания', 'заданий'])} этой страницы
          </p>
        </div>

        <ul className="space-y-2">
          {answers.map((answer, index) => (
            <ReviewItem key={`${index}-${answer.prompt}`} answer={answer} index={index} />
          ))}
        </ul>
      </section>

      <div className="flex justify-center pt-1 sm:justify-start">
        <button type="button" onClick={onRestart} className={moduleGhostButtonClass}>
          <RotateCcw size={15} strokeWidth={2} />
          Пройти ещё раз
        </button>
      </div>
    </div>
  )
}
