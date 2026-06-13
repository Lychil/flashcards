import { useCallback, useEffect, useRef, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { StudyShell } from './StudyShell'

interface TetrisGameProps {
  cards: Flashcard[]
  accentColor?: string
}

const COLS = 8
const ROWS = 12
const CELL = 28

type Cell = string | null

interface Piece {
  id: string
  cells: [number, number][]
  color: string
}

const SHAPES: [number, number][][] = [
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
]

const COLORS = ['#6366f1', '#F5B84C', '#6BC9A7', '#E879A9', '#5B9FD4']

function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null) as Cell[])
}

function rotateCells(cells: [number, number][]): [number, number][] {
  return cells.map(([r, c]) => [c, -r]) as [number, number][]
}

function normalizeCells(cells: [number, number][]): [number, number][] {
  const minR = Math.min(...cells.map(([r]) => r))
  const minC = Math.min(...cells.map(([, c]) => c))
  return cells.map(([r, c]) => [r - minR, c - minC]) as [number, number][]
}

function createPiece(index: number): Piece {
  const shape = SHAPES[index % SHAPES.length]
  return {
    id: `${Date.now()}-${index}`,
    cells: shape,
    color: COLORS[index % COLORS.length],
  }
}

function canPlace(board: Cell[][], cells: [number, number][], row: number, col: number): boolean {
  return cells.every(([r, c]) => {
    const nr = row + r
    const nc = col + c
    if (nc < 0 || nc >= COLS || nr >= ROWS) return false
    if (nr < 0) return true
    return board[nr][nc] === null
  })
}

function mergePiece(board: Cell[][], piece: Piece, row: number, col: number): Cell[][] {
  const next = board.map((r) => [...r])
  piece.cells.forEach(([r, c]) => {
    const nr = row + r
    const nc = col + c
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      next[nr][nc] = piece.color
    }
  })
  return next
}

function clearLines(board: Cell[][]): { board: Cell[][]; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === null))
  const cleared = ROWS - kept.length
  while (kept.length < ROWS) {
    kept.unshift(Array(COLS).fill(null))
  }
  return { board: kept, cleared }
}

interface Challenge {
  card: Flashcard
  options: string[]
}

export function TetrisGame({ cards, accentColor }: TetrisGameProps) {
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard())
  const [piece, setPiece] = useState<Piece>(() => createPiece(0))
  const [pos, setPos] = useState({ row: 0, col: 3 })
  const [pieceCount, setPieceCount] = useState(1)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [manualControl, setManualControl] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [started, setStarted] = useState(false)
  const tickRef = useRef<number | null>(null)

  const spawnPiece = useCallback(
    (count: number) => {
      const next = createPiece(count)
      const startCol = 3
      if (!canPlace(board, next.cells, 0, startCol)) {
        setGameOver(true)
        return
      }
      setPiece(next)
      setPos({ row: 0, col: startCol })
    },
    [board],
  )

  const lockPiece = useCallback(() => {
    const merged = mergePiece(board, piece, pos.row, pos.col)
    const { board: clearedBoard, cleared } = clearLines(merged)
    setBoard(clearedBoard)
    if (cleared > 0) {
      setLines((l) => l + cleared)
      setScore((s) => s + cleared * 100)
    }

    const nextCount = pieceCount + 1
    setPieceCount(nextCount)

    if (nextCount % 3 === 0) {
      const card = pickRandom(cards, 1)[0]
      setChallenge({
        card,
        options: shuffle([
          card.term,
          ...pickRandom(
            cards.filter((c) => c.id !== card.id).map((c) => c.term),
            3,
          ),
        ]),
      })
      return
    }

    spawnPiece(nextCount)
  }, [board, piece, pos, pieceCount, cards, spawnPiece])

  const drop = useCallback(() => {
    if (gameOver || challenge || !started) return
    setPos((p) => {
      if (canPlace(board, piece.cells, p.row + 1, p.col)) {
        return { ...p, row: p.row + 1 }
      }
      lockPiece()
      return p
    })
  }, [board, piece, gameOver, challenge, started, lockPiece])

  const hardDrop = useCallback(() => {
    if (gameOver || challenge || !manualControl) return
    setPos((p) => {
      let row = p.row
      while (canPlace(board, piece.cells, row + 1, p.col)) {
        row += 1
      }
      const merged = mergePiece(board, piece, row, p.col)
      const { board: clearedBoard, cleared } = clearLines(merged)
      setBoard(clearedBoard)
      if (cleared > 0) {
        setLines((l) => l + cleared)
        setScore((s) => s + cleared * 100)
      }
      const nextCount = pieceCount + 1
      setPieceCount(nextCount)
      if (nextCount % 3 === 0) {
        const card = pickRandom(cards, 1)[0]
        setChallenge({
          card,
          options: shuffle([
            card.term,
            ...pickRandom(
              cards.filter((c) => c.id !== card.id).map((c) => c.term),
              3,
            ),
          ]),
        })
      } else {
        spawnPiece(nextCount)
      }
      return { row, col: p.col }
    })
  }, [board, piece, gameOver, challenge, manualControl, pieceCount, cards, spawnPiece])

  const move = (dc: number) => {
    if (gameOver || challenge || !manualControl) return
    setPos((p) => (canPlace(board, piece.cells, p.row, p.col + dc) ? { ...p, col: p.col + dc } : p))
  }

  const rotate = () => {
    if (gameOver || challenge || !manualControl) return
    const rotated = normalizeCells(rotateCells(piece.cells))
    if (canPlace(board, rotated, pos.row, pos.col)) {
      setPiece((p) => ({ ...p, cells: rotated }))
    }
  }

  const handleChallengeAnswer = (option: string) => {
    const correct = option === challenge?.card.term
    setManualControl(correct)
    setChallenge(null)
    if (correct) {
      setScore((s) => s + 50)
    }
    spawnPiece(pieceCount)
  }

  useEffect(() => {
    if (!started || gameOver || challenge) return undefined
    const speed = manualControl ? 800 : 180
    tickRef.current = window.setInterval(drop, speed)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [started, gameOver, challenge, manualControl, drop])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver || challenge) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        move(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        move(1)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        drop()
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        rotate()
      }
      if (e.key === ' ') {
        e.preventDefault()
        hardDrop()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const renderBoard = () => {
    const grid: (Cell | string)[][] = board.map((row) => [...row])
    if (!gameOver && !challenge) {
      piece.cells.forEach(([r, c]) => {
        const nr = pos.row + r
        const nc = pos.col + c
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          grid[nr][nc] = piece.color
        }
      })
    }
    return grid
  }

  const grid = renderBoard()

  if (!started) {
    return (
      <StudyShell title="Условный тетрис" accentColor={accentColor}>
        <div className={`p-6 ${homeCardClass}`}>
          <p className="mb-4 text-[14px] leading-relaxed text-text-secondary">
            Каждая третья фигура — вопрос по модулю. Ответ верный — управляете сами. Ошибка — фигура
            падает быстро.
          </p>
          <p className="mb-6 text-[13px] text-text-tertiary">
            ← → движение · ↑ поворот · ↓ ускорить · пробел — сброс
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="cursor-pointer rounded-xl bg-[#6366f1] px-5 py-2.5 text-[13px] font-medium text-white hover:opacity-90"
          >
            Начать игру
          </button>
        </div>
      </StudyShell>
    )
  }

  return (
    <StudyShell
      title="Условный тетрис"
      subtitle={`Счёт ${score} · Линии ${lines}`}
      accentColor={accentColor}
    >
      <div className="flex flex-col items-center gap-4">
        {!manualControl && !challenge && (
          <p className="text-[13px] font-medium text-[#b04472]">
            Неверный ответ — автопадение включено
          </p>
        )}

        <div
          className="overflow-hidden rounded-[16px] border border-border bg-[#1a1d21] p-1"
          style={{ width: COLS * CELL + 8, height: ROWS * CELL + 8 }}
        >
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
            }}
          >
            {grid.flatMap((row, ri) =>
              row.map((cell, ci) => (
                <div
                  key={`${ri}-${ci}`}
                  className="rounded-[3px]"
                  style={{
                    backgroundColor: cell ?? '#2a2e35',
                    boxShadow: cell ? 'inset 0 -2px 0 rgba(0,0,0,0.15)' : undefined,
                  }}
                />
              )),
            )}
          </div>
        </div>

        <div className="flex gap-2 sm:hidden">
          <button type="button" onClick={() => move(-1)} className="rounded-xl border border-border px-3 py-2 text-[13px]">←</button>
          <button type="button" onClick={rotate} className="rounded-xl border border-border px-3 py-2 text-[13px]">↻</button>
          <button type="button" onClick={() => move(1)} className="rounded-xl border border-border px-3 py-2 text-[13px]">→</button>
          <button type="button" onClick={drop} className="rounded-xl border border-border px-3 py-2 text-[13px]">↓</button>
        </div>

        {gameOver && (
          <div className={`w-full max-w-md p-4 text-center ${homeCardClass}`}>
            <p className="text-[15px] font-semibold text-text-primary">Игра окончена</p>
            <p className="mt-1 text-[13px] text-text-secondary">
              Счёт {score} · Линии {lines}
            </p>
            <button
              type="button"
              onClick={() => {
                setBoard(emptyBoard())
                setPiece(createPiece(0))
                setPos({ row: 0, col: 3 })
                setPieceCount(1)
                setScore(0)
                setLines(0)
                setManualControl(true)
                setGameOver(false)
                setChallenge(null)
              }}
              className="mt-3 cursor-pointer rounded-xl bg-[#6366f1] px-4 py-2 text-[13px] font-medium text-white"
            >
              Заново
            </button>
          </div>
        )}
      </div>

      {challenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-md p-6 ${homeCardClass}`}>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[#6366f1]">
              Слово · фигура #{pieceCount}
            </p>
            <p className="mb-4 text-[16px] leading-relaxed text-text-primary">
              {challenge.card.definition}
            </p>
            <div className="grid gap-2">
              {challenge.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleChallengeAnswer(option)}
                  className="cursor-pointer rounded-xl border border-border px-4 py-3 text-left text-[14px] font-medium transition-colors hover:border-[#6366f1] hover:bg-[#6366f1]/5"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </StudyShell>
  )
}
