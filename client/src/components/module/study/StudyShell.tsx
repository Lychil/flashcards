import { ArrowLeft, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'
import { homeCardClass } from '../../home/homeStyles'

interface StudyShellProps {
  title: string
  subtitle?: string
  progress?: number
  onBack: () => void
  children: ReactNode
}

export function StudyShell({ title, subtitle, progress, onBack, children }: StudyShellProps) {
  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-[#d4d9e0] hover:text-text-primary"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          Все методы
        </button>
        <div className="min-w-0 text-right">
          <p className="truncate text-[14px] font-semibold text-text-primary">{title}</p>
          {subtitle && <p className="text-[12px] text-text-tertiary">{subtitle}</p>}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-[#6366f1] transition-[width] duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
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
  onBack: () => void
}

export function StudyResult({ title, scoreLabel, detail, onRestart, onBack }: StudyResultProps) {
  return (
    <div className={`px-6 py-10 text-center ${homeCardClass}`}>
      <p className="text-[22px] font-semibold tracking-[-0.02em] text-text-primary">{title}</p>
      <p className="mt-2 text-[32px] font-bold tabular-nums text-[#6366f1]">{scoreLabel}</p>
      {detail && <p className="mt-2 text-[14px] text-text-secondary">{detail}</p>}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#6366f1] px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw size={15} strokeWidth={1.75} />
          Ещё раз
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-[#d4d9e0] hover:text-text-primary"
        >
          Все методы
        </button>
      </div>
    </div>
  )
}
