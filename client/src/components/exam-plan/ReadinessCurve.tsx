import type { ReadinessPoint } from '../../types/examPlan'
import { statsCaptionClass, statsCardClass, statsCardPaddingClass, statsLabelClass } from '../stats/statsStyles'

interface ReadinessCurveProps {
  points: ReadinessPoint[]
  accentColor?: string
  isBehind?: boolean
}

export function ReadinessCurve({ points, accentColor = '#5B9FD4', isBehind }: ReadinessCurveProps) {
  if (points.length < 2) return null

  const width = 320
  const height = 120
  const padX = 8
  const padY = 12
  const chartW = width - padX * 2
  const chartH = height - padY * 2

  const minPct = Math.max(0, Math.min(...points.map((p) => p.percent)) - 10)
  const maxPct = 100

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * chartW
    const y = padY + chartH - ((p.percent - minPct) / (maxPct - minPct)) * chartH
    return { x, y, ...p }
  })

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const areaPath = `${linePath} L ${coords.at(-1)!.x} ${padY + chartH} L ${coords[0].x} ${padY + chartH} Z`

  const idealCoords = points.map((_p, i) => {
    const ideal = minPct + ((100 - minPct) * i) / (points.length - 1)
    const x = padX + (i / (points.length - 1)) * chartW
    const y = padY + chartH - ((ideal - minPct) / (maxPct - minPct)) * chartH
    return { x, y }
  })
  const idealPath = idealCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  return (
    <article className={['flex flex-col', statsCardPaddingClass, statsCardClass].join(' ')}>
      <div className="mb-3">
        <p className={statsLabelClass}>Кривая готовности</p>
        <p className={`mt-1 ${statsCaptionClass}`}>
          {isBehind ? 'Прогноз с учётом отставания' : 'Прогноз при текущем темпе'}
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full" aria-hidden>
        <path d={areaPath} fill={`${accentColor}18`} />
        <path
          d={idealPath}
          fill="none"
          stroke="#ebedf2"
          strokeWidth={2}
          strokeDasharray="4 4"
        />
        <path
          d={linePath}
          fill="none"
          stroke={isBehind ? '#E879A9' : accentColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c) => (
          <circle
            key={c.date}
            cx={c.x}
            cy={c.y}
            r={3}
            fill={c.isAdjusted ? '#E879A9' : accentColor}
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-[10px] tabular-nums text-text-tertiary">
        <span>{Math.round(minPct)}%</span>
        <span className="text-text-secondary">— — идеальный темп</span>
        <span>100%</span>
      </div>
    </article>
  )
}
