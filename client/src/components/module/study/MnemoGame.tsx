import { useEffect, useMemo, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { StudyResult, StudyShell } from './StudyShell'

interface MnemoGameProps {
  cards: Flashcard[]
  accentColor?: string
}

type MnemoPhase = 'setup' | 'memorize' | 'distract' | 'recall' | 'result'
type SequenceType = 'numbers' | 'colors'

const COLORS = ['#6366f1', '#F5B84C', '#6BC9A7', '#E879A9', '#5B9FD4', '#E0956B'] as const

const DEFAULT_MNEMO_CONFIG = { length: 5, distractors: 2 } as const

function buildSequence(type: SequenceType, length: number): string[] {
  if (type === 'numbers') {
    return Array.from({ length }, () => String(Math.floor(Math.random() * 9) + 1))
  }
  return pickRandom([...COLORS], length)
}

export function MnemoGame({ cards, accentColor }: MnemoGameProps) {
  const [phase, setPhase] = useState<MnemoPhase>('setup')
  const [sequenceType, setSequenceType] = useState<SequenceType>('colors')
  const [sequence, setSequence] = useState<string[]>([])
  const [recallInput, setRecallInput] = useState<string[]>([])
  const [distractorIndex, setDistractorIndex] = useState(0)
  const [distractorScore, setDistractorScore] = useState(0)
  const [countdown, setCountdown] = useState(5)

  const config = DEFAULT_MNEMO_CONFIG

  const distractorQuestions = useMemo(
    () =>
      shuffle(cards).slice(0, config.distractors).map((card) => ({
        card,
        options: shuffle([
          card.term,
          ...pickRandom(
            cards.filter((c) => c.id !== card.id).map((c) => c.term),
            3,
          ),
        ]),
      })),
    [cards, config.distractors, phase],
  )

  const currentDistractor = distractorQuestions[distractorIndex]

  const startGame = () => {
    setSequence(buildSequence(sequenceType, config.length))
    setRecallInput([])
    setDistractorIndex(0)
    setDistractorScore(0)
    setCountdown(5)
    setPhase('memorize')
  }

  useEffect(() => {
    if (phase !== 'memorize') return undefined
    if (countdown <= 0) {
      setPhase('distract')
      return undefined
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [phase, countdown])

  const handleDistractorAnswer = (option: string) => {
    if (option === currentDistractor.card.term) {
      setDistractorScore((s) => s + 1)
    }
    if (distractorIndex >= distractorQuestions.length - 1) {
      setPhase('recall')
    } else {
      setDistractorIndex((i) => i + 1)
    }
  }

  const pickRecallItem = (item: string) => {
    if (recallInput.length >= sequence.length) return
    setRecallInput((prev) => [...prev, item])
  }

  const undoRecall = () => setRecallInput((prev) => prev.slice(0, -1))

  const submitRecall = () => {
    setPhase('result')
  }

  const isCorrect =
    recallInput.length === sequence.length && recallInput.every((v, i) => v === sequence[i])

  if (phase === 'setup') {
    return (
      <StudyShell title="Мнемо" accentColor={accentColor}>
        <div className={`space-y-6 p-6 ${homeCardClass}`}>
          <div>
            <p className="mb-3 text-[13px] font-medium text-text-primary">Тип последовательности</p>
            <div className="flex flex-wrap gap-2">
              {(['colors', 'numbers'] as SequenceType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSequenceType(type)}
                  className={[
                    'cursor-pointer rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors',
                    sequenceType === type
                      ? 'border-[#6366f1] bg-[#6366f1]/10 text-[#6366f1]'
                      : 'border-border text-text-secondary hover:border-[#d4d9e0]',
                  ].join(' ')}
                >
                  {type === 'colors' ? 'Цвета' : 'Числа'}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="cursor-pointer rounded-xl bg-[#6366f1] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
          >
            Начать
          </button>
        </div>
      </StudyShell>
    )
  }

  if (phase === 'memorize') {
    return (
      <StudyShell title="Мнемо" subtitle="Запомните последовательность" accentColor={accentColor}>
        <div className={`p-8 text-center ${homeCardClass}`}>
          <p className="mb-6 text-[14px] text-text-secondary">
            Запоминайте — через {countdown} сек. начнётся отвлечение
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {sequence.map((item, i) =>
              sequenceType === 'colors' ? (
                <div
                  key={i}
                  className="h-14 w-14 rounded-2xl border border-border"
                  style={{ backgroundColor: item }}
                />
              ) : (
                <div
                  key={i}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-[22px] font-bold text-text-primary"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </div>
      </StudyShell>
    )
  }

  if (phase === 'distract' && currentDistractor) {
    return (
      <StudyShell
        title="Мнемо"
        subtitle={`Отвлечение ${distractorIndex + 1} / ${distractorQuestions.length}`}
        accentColor={accentColor}
      >
        <div className={`p-6 ${homeCardClass}`}>
          <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Быстрый вопрос
          </p>
          <p className="mb-6 text-[18px] leading-relaxed text-text-primary">
            {currentDistractor.card.definition}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {currentDistractor.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleDistractorAnswer(option)}
                className="cursor-pointer rounded-xl border border-border bg-white px-4 py-3 text-left text-[14px] font-medium transition-colors hover:border-[#6366f1] hover:bg-[#6366f1]/5"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </StudyShell>
    )
  }

  if (phase === 'recall') {
    const pool =
      sequenceType === 'colors'
        ? [...new Set([...COLORS, ...sequence])]
        : Array.from({ length: 9 }, (_, i) => String(i + 1))

    return (
      <StudyShell title="Мнемо" subtitle="Воспроизведите последовательность" accentColor={accentColor}>
        <div className={`p-6 ${homeCardClass}`}>
          <div className="mb-4 flex min-h-[56px] flex-wrap items-center gap-2 rounded-xl border border-dashed border-border bg-surface-subtle/50 px-3 py-2">
            {recallInput.length === 0 ? (
              <span className="text-[13px] text-text-tertiary">Нажимайте элементы по порядку</span>
            ) : (
              recallInput.map((item, i) =>
                sequenceType === 'colors' ? (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-xl"
                    style={{ backgroundColor: item }}
                  />
                ) : (
                  <div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-[16px] font-bold"
                  >
                    {item}
                  </div>
                ),
              )
            )}
          </div>
          <div className="mb-6 flex flex-wrap gap-2">
            {pool.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => pickRecallItem(item)}
                disabled={recallInput.length >= sequence.length}
                className="cursor-pointer disabled:opacity-40"
              >
                {sequenceType === 'colors' ? (
                  <div
                    className="h-10 w-10 rounded-xl border border-border transition-transform hover:scale-105"
                    style={{ backgroundColor: item }}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-[15px] font-bold hover:border-[#6366f1]">
                    {item}
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={undoRecall}
              className="cursor-pointer rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-text-secondary hover:border-[#d4d9e0]"
            >
              Отменить
            </button>
            <button
              type="button"
              onClick={submitRecall}
              disabled={recallInput.length !== sequence.length}
              className="cursor-pointer rounded-xl bg-[#6366f1] px-4 py-2.5 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              Проверить
            </button>
          </div>
        </div>
      </StudyShell>
    )
  }

  return (
    <StudyShell title="Мнемо" accentColor={accentColor}>
      <StudyResult
        title={isCorrect ? 'Отлично!' : 'Не совсем'}
        scoreLabel={isCorrect ? 'Последовательность верна' : 'Есть ошибки'}
        detail={`Отвлечение: ${distractorScore}/${distractorQuestions.length} · Длина: ${sequence.length}`}
        onRestart={startGame}
      />
    </StudyShell>
  )
}
