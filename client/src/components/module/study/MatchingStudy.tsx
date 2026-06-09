import { useMemo, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { StudyResult, StudyShell } from './StudyShell'

interface MatchingStudyProps {
  cards: Flashcard[]
  onBack: () => void
}

type MatchSide = 'term' | 'definition'

interface MatchItem {
  id: string
  side: MatchSide
  cardId: string
  text: string
}

export function MatchingStudy({ cards, onBack }: MatchingStudyProps) {
  const pairCount = Math.min(cards.length, 6)
  const [session, setSession] = useState(0)
  const round = useMemo(() => pickRandom(cards, pairCount), [cards, pairCount, session])
  const [selected, setSelected] = useState<MatchItem | null>(null)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [finished, setFinished] = useState(false)

  const items = useMemo(() => {
    const terms: MatchItem[] = round.map((c) => ({
      id: `t-${c.id}`,
      side: 'term',
      cardId: c.id,
      text: c.term,
    }))
    const defs: MatchItem[] = shuffle(
      round.map((c) => ({
        id: `d-${c.id}`,
        side: 'definition',
        cardId: c.id,
        text: c.definition,
      })),
    )
    return { terms, defs }
  }, [round])

  const progress = (matchedIds.size / round.length) * 100

  const handlePick = (item: MatchItem) => {
    if (matchedIds.has(item.cardId) || wrongPair) return

    if (!selected) {
      setSelected(item)
      return
    }

    if (selected.id === item.id) {
      setSelected(null)
      return
    }

    if (selected.side === item.side) {
      setSelected(item)
      return
    }

    setAttempts((a) => a + 1)

    if (selected.cardId === item.cardId) {
      setMatchedIds((prev) => new Set([...prev, item.cardId]))
      setSelected(null)
      if (matchedIds.size + 1 >= round.length) {
        setTimeout(() => setFinished(true), 400)
      }
    } else {
      setWrongPair([selected.id, item.id])
      setTimeout(() => {
        setWrongPair(null)
        setSelected(null)
      }, 700)
    }
  }

  const itemClass = (item: MatchItem) => {
    const isMatched = matchedIds.has(item.cardId)
    const isSelected = selected?.id === item.id
    const isWrong = wrongPair?.includes(item.id)

    if (isMatched) return 'border-[#6BC9A7] bg-[#6BC9A7]/10 opacity-60'
    if (isWrong) return 'border-[#E879A9] bg-[#E879A9]/10'
    if (isSelected) return 'border-[#6366f1] bg-[#6366f1]/10'
    return 'border-border bg-white hover:border-[#d4d9e0]'
  }

  if (finished) {
    return (
      <StudyShell title="Сопоставление" onBack={onBack}>
        <StudyResult
          title="Все пары найдены!"
          scoreLabel={`${round.length} пар`}
          detail={`Попыток: ${attempts}`}
          onRestart={() => {
            setSession((s) => s + 1)
            setSelected(null)
            setMatchedIds(new Set())
            setWrongPair(null)
            setAttempts(0)
            setFinished(false)
          }}
          onBack={onBack}
        />
      </StudyShell>
    )
  }

  return (
    <StudyShell
      title="Сопоставление"
      subtitle={`${matchedIds.size} / ${round.length} пар`}
      progress={progress}
      onBack={onBack}
    >
      <div className={`grid gap-4 p-4 sm:grid-cols-2 sm:p-6 ${homeCardClass}`}>
        <div className="space-y-2">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Термины
          </p>
          {items.terms.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matchedIds.has(item.cardId)}
              onClick={() => handlePick(item)}
              className={`w-full cursor-pointer rounded-xl border px-3 py-3 text-left text-[14px] font-medium transition-colors disabled:cursor-default ${itemClass(item)}`}
            >
              {item.text}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Определения
          </p>
          {items.defs.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={matchedIds.has(item.cardId)}
              onClick={() => handlePick(item)}
              className={`w-full cursor-pointer rounded-xl border px-3 py-3 text-left text-[13px] leading-snug transition-colors disabled:cursor-default ${itemClass(item)}`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </StudyShell>
  )
}
