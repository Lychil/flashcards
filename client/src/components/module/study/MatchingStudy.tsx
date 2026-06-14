import { useMemo, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { StudyResult, StudyShell } from './StudyShell'

interface MatchingStudyProps {
  cards: Flashcard[]
  accentColor?: string
}

type MatchSide = 'term' | 'definition'

interface MatchItem {
  id: string
  side: MatchSide
  cardId: string
  text: string
}

export function MatchingStudy({ cards, accentColor }: MatchingStudyProps) {
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
      <StudyShell title="Сопоставление" accentColor={accentColor}>
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
        />
      </StudyShell>
    )
  }

  return (
    <StudyShell
      title="Сопоставление"
      subtitle={`${matchedIds.size} / ${round.length} пар`}
      progress={progress}
      accentColor={accentColor}
    >
      <div className={`p-4 sm:p-6 ${homeCardClass}`}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Лицевая сторона
          </p>
          <p className="mb-1 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Обратная сторона
          </p>

          {items.terms.map((term, index) => {
            const def = items.defs[index]

            return (
              <div key={term.id} className="contents">
                <button
                  type="button"
                  disabled={matchedIds.has(term.cardId)}
                  onClick={() => handlePick(term)}
                  className={`flex h-full min-h-[3.25rem] cursor-pointer items-start rounded-xl border px-3 py-3 text-left text-[14px] font-medium transition-colors disabled:cursor-default ${itemClass(term)}`}
                >
                  {term.text}
                </button>
                <button
                  type="button"
                  disabled={matchedIds.has(def.cardId)}
                  onClick={() => handlePick(def)}
                  className={`flex h-full min-h-[3.25rem] cursor-pointer items-start rounded-xl border px-3 py-3 text-left text-[14px] leading-snug transition-colors disabled:cursor-default ${itemClass(def)}`}
                >
                  {def.text}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </StudyShell>
  )
}
