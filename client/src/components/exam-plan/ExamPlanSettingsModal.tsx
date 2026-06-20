import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { Module } from '../../types/module'
import { planSubsectionTitleClass } from './examPlanStyles'
import { ExamPlanSettings } from './ExamPlanSettings'

interface ExamPlanSettingsModalProps {
  open: boolean
  onClose: () => void
  examDate: string
  goalTitle: string
  selectedIds: Set<string>
  modules: Module[]
  minDate: string
  isDirty: boolean
  hasPlan: boolean
  onExamDateChange: (value: string) => void
  onGoalTitleChange: (value: string) => void
  onToggleModule: (id: string) => void
  onSave: () => void
  onReset?: () => void
  canReset?: boolean
}

export function ExamPlanSettingsModal({
  open,
  onClose,
  onSave,
  onReset,
  ...settingsProps
}: ExamPlanSettingsModalProps) {
  useEffect(() => {
    if (!open) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const handleSave = () => {
    onSave()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-plan-settings-title"
        className={[
          'max-h-[min(90vh,880px)] w-full overflow-y-auto border border-border bg-white',
          'rounded-t-[22px] p-5 sm:rounded-[22px] sm:p-6 lg:p-8',
          'max-w-[calc(100vw-2rem)] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 id="exam-plan-settings-title" className={planSubsectionTitleClass}>
            Настройки плана
          </h3>
          <button type="button" onClick={onClose} aria-label="Закрыть">
            <X size={18} strokeWidth={2} className="text-text-tertiary" />
          </button>
        </div>

        <ExamPlanSettings
          {...settingsProps}
          embedded
          onSave={handleSave}
          onReset={onReset}
        />
      </div>
    </div>
  )
}
