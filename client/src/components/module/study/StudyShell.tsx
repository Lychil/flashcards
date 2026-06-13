import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { modulePrimaryButtonClass } from '../moduleStyles'

interface StudyShellProps {
  title: string
  subtitle?: string
  progress?: number
  accentColor?: string
  children: ReactNode
}

export function StudyShell({ title, subtitle, progress, accentColor, children }: StudyShellProps) {
  const progressColor = accentColor ?? '#6366f1'

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-[18px] font-bold tracking-[-0.02em] text-text-primary">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] font-medium text-text-secondary">{subtitle}</p>}
      </div>

      {progress !== undefined && (
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: progressColor }}
          />
        </div>
      )}

      {children}
    </div>
  )
}

interface StudyResultProps {
  title: string
  scoreLabel: string
  detail?: string
  onRestart: () => void
}

export function StudyResult({ title, scoreLabel, detail, onRestart }: StudyResultProps) {
  return (
    <div className="py-10 text-center">
      <p className="text-[22px] font-bold tracking-[-0.02em] text-text-primary">{title}</p>
      <p className="mt-2 text-[34px] font-bold tabular-nums text-text-primary">{scoreLabel}</p>
      {detail && <p className="mt-2 text-[14px] font-medium text-text-secondary">{detail}</p>}
      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onRestart} className={modulePrimaryButtonClass}>
          <RotateCcw size={15} strokeWidth={2} />
          Ещё раз
        </button>
      </div>
    </div>
  )
}
