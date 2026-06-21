import type { Module } from '../../types/module'
import { ModalOverlay } from '../ui/ModalOverlay'
import { ExamPlanSettings } from './ExamPlanSettings'

interface ExamPlanSettingsModalProps {
  open: boolean
  onClose: () => void
  examDate: string
  goalTitle: string
  targetReadinessPercent: number
  selectedIds: Set<string>
  modules: Module[]
  minDate: string
  isDirty: boolean
  hasPlan: boolean
  onExamDateChange: (value: string) => void
  onGoalTitleChange: (value: string) => void
  onTargetReadinessChange: (value: number) => void
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
  return (
    <ModalOverlay
      open={open}
      onClose={onClose}
      title="Настройки плана"
      titleId="exam-plan-settings-title"
    >
      <ExamPlanSettings
        {...settingsProps}
        embedded
        onSave={onSave}
        onReset={onReset}
      />
    </ModalOverlay>
  )
}
