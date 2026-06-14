import { useCallback, useEffect, useRef, useState } from 'react'
import { pickRandom, shuffle } from '../../../lib/shuffle'
import type { Flashcard } from '../../../types/flashcard'
import { homeCardClass } from '../../home/homeStyles'
import { moduleGhostButtonClass, modulePrimaryButtonClass } from '../moduleStyles'
import { StudyShell } from './StudyShell'

interface FallingBlocksGameProps {
  cards: Flashcard[]
  accentColor?: string
}

const COLS = 10
const ROWS = 16

type Cell = string | null

interface Piece {
  id: string
  cells: [number, number][]
  color: string
}

const SHAPES: [number, number][][] = [
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 2],
  ],
]

const COLORS = ['#6366f1', '#F5B84C', '#6BC9A7', '#E879A9', '#5B9FD4']

function lineScore(cleared: number): number {
  if (cleared <= 0) return 0
  if (cleared === 1) return 100
  if (cleared === 2) return 250
  if (cleared === 3) return 450
  return 800
}

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

function pieceWidth(cells: [number, number][]): number {
  const minC = Math.min(...cells.map(([, c]) => c))
  const maxC = Math.max(...cells.map(([, c]) => c))
  return maxC - minC + 1
}

function spawnColumn(cells: [number, number][]): number {
  return Math.max(0, Math.floor((COLS - pieceWidth(cells)) / 2))
}

function createPiece(index: number): Piece {
  const shape = SHAPES[index % SHAPES.length]
  return {
    id: `${Date.now()}-${index}-${Math.random()}`,
    cells: shape,
    color: COLORS[index % COLORS.length],
  }
}

function canPlace(board: Cell[][], cells: [number, number][], row: number, col: number): boolean {
  return cells.every(([r, c]) => {
    const nr = row + r
    const nc = col + c
    if (nc < 0 || nc >= COLS || nr >= ROWS || nr < 0) return false
    return board[nr][nc] === null
  })
}

const ROTATION_KICKS: [number, number][] = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [-2, 0],
  [2, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
]

function getRotatedCells(cells: [number, number][]): [number, number][] {
  return normalizeCells(rotateCells(cells))
}

function findRotationPlacement(
  board: Cell[][],
  cells: [number, number][],
  row: number,
  col: number,
): { cells: [number, number][]; row: number; col: number } | null {
  const rotated = getRotatedCells(cells)

  for (const [kickRow, kickCol] of ROTATION_KICKS) {
    const nextRow = row + kickRow
    const nextCol = col + kickCol
    if (canPlace(board, rotated, nextRow, nextCol)) {
      return { cells: rotated, row: nextRow, col: nextCol }
    }
  }

  return null
}

function findMovePlacement(
  board: Cell[][],
  cells: [number, number][],
  row: number,
  col: number,
  deltaCol: number,
): { row: number; col: number } | null {
  const nextCol = col + deltaCol
  if (!canPlace(board, cells, row, nextCol)) return null
  return { row, col: nextCol }
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

function findFullRows(board: Cell[][]): number[] {
  return board
    .map((row, index) => (row.every((cell) => cell !== null) ? index : -1))
    .filter((index) => index >= 0)
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

interface ScorePop {
  id: number
  points: number
}

function PiecePreview({ piece, size = 'md' }: { piece: Piece; size?: 'sm' | 'md' }) {
  const maxR = Math.max(...piece.cells.map(([r]) => r))
  const maxC = Math.max(...piece.cells.map(([, c]) => c))
  const rows = maxR + 1
  const cols = maxC + 1
  const cellClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <div
      className="inline-grid gap-0.5"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: rows * cols }, (_, index) => {
        const r = Math.floor(index / cols)
        const c = index % cols
        const filled = piece.cells.some(([pr, pc]) => pr === r && pc === c)

        return (
          <div
            key={`${piece.id}-${r}-${c}`}
            className={[
              cellClass,
              'rounded-[4px]',
              filled ? '' : 'bg-transparent',
            ].join(' ')}
            style={filled ? { backgroundColor: piece.color } : undefined}
          />
        )
      })}
    </div>
  )
}

export function FallingBlocksGame({ cards, accentColor }: FallingBlocksGameProps) {
  const [board, setBoard] = useState<Cell[][]>(() => emptyBoard())
  const [piece, setPiece] = useState<Piece>(() => createPiece(0))
  const [nextPiece, setNextPiece] = useState<Piece>(() => createPiece(1))
  const [pos, setPos] = useState(() => ({ row: 0, col: spawnColumn(createPiece(0).cells) }))
  const [pieceCount, setPieceCount] = useState(1)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [forcedAutoDrops, setForcedAutoDrops] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [started, setStarted] = useState(false)
  const [flashRows, setFlashRows] = useState<number[]>([])
  const [scorePop, setScorePop] = useState<ScorePop | null>(null)
  const [lineBurst, setLineBurst] = useState(false)
  const tickRef = useRef<number | null>(null)
  const lockingRef = useRef(false)
  const boardRef = useRef(board)
  const pieceRef = useRef(piece)
  const posRef = useRef(pos)
  const pieceCountRef = useRef(pieceCount)
  const forcedAutoDropsRef = useRef(forcedAutoDrops)
  const nextPieceRef = useRef(nextPiece)
  const gameStateRef = useRef({
    gameOver,
    challenge,
    started,
    flashRows,
  })

  boardRef.current = board
  pieceRef.current = piece
  posRef.current = pos
  pieceCountRef.current = pieceCount
  forcedAutoDropsRef.current = forcedAutoDrops
  nextPieceRef.current = nextPiece
  gameStateRef.current = { gameOver, challenge, started, flashRows }

  const autoMode = forcedAutoDrops > 0
  const canControl = !gameOver && !challenge && !autoMode && flashRows.length === 0

  const spawnFromNext = useCallback((count: number, upcoming: Piece) => {
    const startCol = spawnColumn(upcoming.cells)
    if (!canPlace(boardRef.current, upcoming.cells, 0, startCol)) {
      setGameOver(true)
      return
    }
    setPiece(upcoming)
    setNextPiece(createPiece(count + 1))
    const nextPos = { row: 0, col: startCol }
    pieceRef.current = upcoming
    posRef.current = nextPos
    setPos(nextPos)
  }, [])

  const showScorePop = (points: number) => {
    const id = Date.now()
    setScorePop({ id, points })
    window.setTimeout(() => {
      setScorePop((current) => (current?.id === id ? null : current))
    }, 900)
  }

  const afterLock = useCallback(
    (nextCount: number) => {
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

      spawnFromNext(nextCount, nextPieceRef.current)
    },
    [cards, spawnFromNext],
  )

  const lockPieceAt = useCallback(
    (lockRow: number, lockCol: number) => {
      if (lockingRef.current) return
      lockingRef.current = true

      const currentBoard = boardRef.current
      const currentPiece = pieceRef.current
      const currentPieceCount = pieceCountRef.current
      const merged = mergePiece(currentBoard, currentPiece, lockRow, lockCol)
      const fullRows = findFullRows(merged)
      const nextCount = currentPieceCount + 1

      if (forcedAutoDropsRef.current > 0) {
        setForcedAutoDrops((value) => Math.max(0, value - 1))
      }

      const finishLock = (nextBoard: Cell[][]) => {
        setBoard(nextBoard)
        setPieceCount(nextCount)
        afterLock(nextCount)
        lockingRef.current = false
      }

      if (fullRows.length > 0) {
        setFlashRows(fullRows)
        setLineBurst(true)
        const points = lineScore(fullRows.length)
        setScore((value) => value + points)
        setLines((value) => value + fullRows.length)
        showScorePop(points)

        window.setTimeout(() => {
          const { board: clearedBoard } = clearLines(merged)
          setFlashRows([])
          setLineBurst(false)
          finishLock(clearedBoard)
        }, 420)
        return
      }

      finishLock(merged)
    },
    [afterLock],
  )

  const lockPieceAtRef = useRef(lockPieceAt)
  lockPieceAtRef.current = lockPieceAt

  const tickDrop = useCallback(() => {
    const { gameOver: over, challenge: activeChallenge, started: playing, flashRows: flashing } =
      gameStateRef.current

    if (over || activeChallenge || !playing || flashing.length > 0 || lockingRef.current) return

    const currentBoard = boardRef.current
    const currentPiece = pieceRef.current
    const currentPos = posRef.current

    if (canPlace(currentBoard, currentPiece.cells, currentPos.row + 1, currentPos.col)) {
      const nextPos = { row: currentPos.row + 1, col: currentPos.col }
      posRef.current = nextPos
      setPos(nextPos)
      return
    }

    lockPieceAtRef.current(currentPos.row, currentPos.col)
  }, [])

  const drop = tickDrop

  const hardDrop = useCallback(() => {
    if (!canControl) return

    const currentBoard = boardRef.current
    const currentPiece = pieceRef.current
    const currentPos = posRef.current

    let row = currentPos.row
    while (canPlace(currentBoard, currentPiece.cells, row + 1, currentPos.col)) {
      row += 1
    }

    setPos({ row, col: currentPos.col })
    posRef.current = { row, col: currentPos.col }
    lockPieceAt(row, currentPos.col)
  }, [canControl, lockPieceAt])

  const move = (dc: number) => {
    if (!canControl) return

    const currentBoard = boardRef.current
    const currentPiece = pieceRef.current
    const currentPos = posRef.current
    const nextPos = findMovePlacement(
      currentBoard,
      currentPiece.cells,
      currentPos.row,
      currentPos.col,
      dc,
    )

    if (!nextPos) return

    posRef.current = nextPos
    setPos(nextPos)
  }

  const rotate = () => {
    if (!canControl) return

    const currentBoard = boardRef.current
    const currentPiece = pieceRef.current
    const currentPos = posRef.current
    const nextPlacement = findRotationPlacement(
      currentBoard,
      currentPiece.cells,
      currentPos.row,
      currentPos.col,
    )

    if (!nextPlacement) return

    const nextPiece = { ...currentPiece, cells: nextPlacement.cells }
    pieceRef.current = nextPiece
    posRef.current = { row: nextPlacement.row, col: nextPlacement.col }
    setPiece(nextPiece)
    setPos({ row: nextPlacement.row, col: nextPlacement.col })
  }

  const handleChallengeAnswer = (option: string) => {
    const correct = option === challenge?.card.term
    setChallenge(null)

    if (correct) {
      setScore((value) => value + 50)
      showScorePop(50)
    } else {
      setForcedAutoDrops(1)
    }

    spawnFromNext(pieceCountRef.current, nextPieceRef.current)
  }

  const resetGame = () => {
    const first = createPiece(0)
    setBoard(emptyBoard())
    setPiece(first)
    setNextPiece(createPiece(1))
    setPos({ row: 0, col: spawnColumn(first.cells) })
    setPieceCount(1)
    setScore(0)
    setLines(0)
    setForcedAutoDrops(0)
    setGameOver(false)
    setChallenge(null)
    setFlashRows([])
    setScorePop(null)
    setLineBurst(false)
    lockingRef.current = false
  }

  useEffect(() => {
    if (!started || gameOver || challenge || flashRows.length > 0) return undefined
    const speed = autoMode ? 140 : 780
    tickRef.current = window.setInterval(tickDrop, speed)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [started, gameOver, challenge, autoMode, flashRows.length, tickDrop])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!started || gameOver || challenge || flashRows.length > 0) return
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

  const showActivePiece = !gameOver && !challenge && flashRows.length === 0

  const boardGridStyle = {
    gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
    width: 'clamp(250px, 32vw, 360px)',
    aspectRatio: `${COLS} / ${ROWS}`,
  } as const

  if (!started) {
    return (
      <StudyShell title="Падающие блоки" accentColor={accentColor}>
        <div className={`p-6 ${homeCardClass}`}>
          <p className="mb-4 text-[14px] leading-relaxed text-text-secondary">
            Каждая третья фигура — вопрос по модулю. Ответ верный — управляете сами. Ошибка — одна
            фигура падает автоматически.
          </p>
          <p className="mb-6 text-[13px] text-text-tertiary">
            ← → движение · ↑ поворот · ↓ ускорить · пробел — сброс
          </p>
          <button type="button" onClick={() => setStarted(true)} className={modulePrimaryButtonClass}>
            Начать игру
          </button>
        </div>
      </StudyShell>
    )
  }

  return (
    <StudyShell title="Падающие блоки" accentColor={accentColor}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 min-[900px]:max-w-none min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-center min-[900px]:gap-6">
        <div className="mx-auto w-full max-w-fit min-[900px]:mx-0">
          {autoMode && !challenge && (
            <p className="mb-3 text-center text-[13px] font-medium text-[#b04472] min-[900px]:text-left">
              Неверный ответ — автопадение одной фигуры
            </p>
          )}

          <div
            className={[
              'relative overflow-hidden rounded-[18px] border border-border bg-white p-2 shadow-[var(--shadow-card)] transition-shadow duration-300',
              lineBurst ? 'shadow-[0_0_0_2px_rgba(107,201,167,0.35),var(--shadow-card)]' : '',
            ].join(' ')}
          >
            <div
              className="pointer-events-none absolute left-2 right-2 top-2 z-10 h-[3px] rounded-full bg-[#ef4444] shadow-[0_0_0_1px_rgba(239,68,68,0.25)]"
              aria-hidden
            />

            <div className="relative p-[3px]">
              <div
                className="grid gap-[3px] bg-[#eef0f4]"
                style={boardGridStyle}
              >
                {board.flatMap((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isFlashing = flashRows.includes(rowIndex)

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={[
                          'rounded-[4px]',
                          isFlashing
                            ? 'scale-[0.92] opacity-90 transition-[transform,opacity] duration-200'
                            : '',
                        ].join(' ')}
                        style={{
                          backgroundColor: isFlashing ? '#6BC9A7' : (cell ?? '#f8f9fc'),
                          boxShadow: cell
                            ? 'inset 0 -2px 0 rgba(18, 21, 26, 0.08)'
                            : 'inset 0 0 0 1px rgba(212, 217, 224, 0.55)',
                        }}
                      />
                    )
                  }),
                )}
              </div>

              {showActivePiece && (
                <div
                  className="pointer-events-none absolute inset-[3px] grid gap-[3px]"
                  style={{
                    gridTemplateColumns: boardGridStyle.gridTemplateColumns,
                    gridTemplateRows: boardGridStyle.gridTemplateRows,
                  }}
                >
                  {piece.cells.map(([r, c], cellIndex) => (
                    <div
                      key={`${piece.id}-${cellIndex}`}
                      className="rounded-[4px]"
                      style={{
                        gridColumnStart: pos.col + c + 1,
                        gridRowStart: pos.row + r + 1,
                        backgroundColor: piece.color,
                        boxShadow: 'inset 0 -2px 0 rgba(18, 21, 26, 0.08)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {scorePop && (
              <div className="pointer-events-none absolute inset-x-0 top-1/3 z-20 flex justify-center">
                <span className="animate-[blocks-score-pop_0.9s_ease-out_forwards] rounded-full bg-white/95 px-4 py-2 text-[18px] font-bold tabular-nums text-[#2d8a66] shadow-lg">
                  +{scorePop.points}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-2 min-[900px]:hidden">
            <button type="button" onClick={() => move(-1)} className={moduleGhostButtonClass}>
              ←
            </button>
            <button type="button" onClick={rotate} className={moduleGhostButtonClass}>
              ↻
            </button>
            <button type="button" onClick={() => move(1)} className={moduleGhostButtonClass}>
              →
            </button>
            <button type="button" onClick={drop} className={moduleGhostButtonClass}>
              ↓
            </button>
            <button type="button" onClick={hardDrop} className={moduleGhostButtonClass}>
              Сброс
            </button>
          </div>
        </div>

        <aside className="w-full min-[900px]:w-[188px]">
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Очки
              </p>
              <p className="mt-1 text-[28px] font-bold tabular-nums leading-none tracking-[-0.03em] text-text-primary">
                {score}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 min-[900px]:grid-cols-1">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Линии
                </p>
                <p className="mt-1 text-[20px] font-bold tabular-nums text-text-primary">{lines}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                  Режим
                </p>
                <p className="mt-1 text-[14px] font-medium text-text-primary">
                  {autoMode ? 'Автопадение' : 'Ручной'}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
                Следующая
              </p>
              <PiecePreview piece={nextPiece} />
            </div>

            <p className="hidden text-[12px] leading-relaxed text-text-tertiary min-[900px]:block">
              Красная линия — предел. Блоки не могут выходить выше неё.
            </p>
          </div>
        </aside>
      </div>

      {gameOver && (
        <div className={`mx-auto mt-4 w-full max-w-md p-4 text-center ${homeCardClass}`}>
          <p className="text-[15px] font-semibold text-text-primary">Игра окончена</p>
          <p className="mt-1 text-[13px] text-text-secondary">
            Счёт {score} · Линии {lines}
          </p>
          <button type="button" onClick={resetGame} className={`mt-3 ${modulePrimaryButtonClass}`}>
            Заново
          </button>
        </div>
      )}

      {challenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className={`w-full max-w-md p-6 ${homeCardClass}`}>
            <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
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
                  className="cursor-pointer rounded-xl border border-border px-4 py-3 text-left text-[14px] font-medium transition-colors hover:border-[#d4d9e0] hover:bg-surface-subtle/40"
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
