import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { Module } from '../../types/module'
import { DEFAULT_PLAN_TARGET_READINESS_PERCENT } from '../../types/examPlan'
import { moduleGhostButtonClass, modulePrimaryButtonClass } from '../module/moduleStyles'
import { textFieldInputClass } from '../ui/SearchBar'
import { PLAN_PURPLE, planLabelClass, planSurfaceClass } from './examPlanStyles'

const planSettingsInputClass = [textFieldInputClass, 'min-h-12'].join(' ')

function PlanSettingsField({
  label,
  hint,
  children,
  className = '',
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={['min-w-0', className].filter(Boolean).join(' ')}>
      <span className={`mb-1 block ${planLabelClass}`}>{label}</span>
      {children}
      {hint ? <p className="mt-1 text-[12px] leading-snug text-text-tertiary">{hint}</p> : null}
    </div>
  )
}

interface ExamPlanSettingsProps {
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
  defaultOpen?: boolean
  embedded?: boolean
}

export function ExamPlanSettings({
  examDate,
  goalTitle,
  targetReadinessPercent,
  selectedIds,
  modules,
  minDate,
  isDirty,
  hasPlan,
  onExamDateChange,
  onGoalTitleChange,
  onTargetReadinessChange,
  onToggleModule,
  onSave,
  onReset,
  canReset = false,
  defaultOpen = false,
  embedded = false,
}: ExamPlanSettingsProps) {
  const [open, setOpen] = useState(defaultOpen || !hasPlan)
  const expanded = embedded || open

  const fields = (
    <div className="space-y-4">
      <div className="grid gap-x-3 gap-y-1.5 sm:grid-cols-2">
        <PlanSettingsField label="Дата экзамена">
          <input
            type="date"
            value={examDate}
            min={minDate}
            onChange={(e) => onExamDateChange(e.target.value)}
            className={planSettingsInputClass}
          />
        </PlanSettingsField>

        <PlanSettingsField
          label="Цель плана"
          hint="Например: уверенно сдать экзамен по анатомии"
        >
          <input
            type="text"
            value={goalTitle}
            onChange={(e) => onGoalTitleChange(e.target.value)}
            placeholder="Сформулируйте, к чему готовитесь"
            maxLength={120}
            className={planSettingsInputClass}
          />
        </PlanSettingsField>

        <PlanSettingsField label="Цель к экзамену" className="sm:max-w-[11rem]">
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              min={50}
              max={100}
              step={1}
              value={targetReadinessPercent}
              onChange={(e) => {
                const next = Number.parseInt(e.target.value, 10)
                if (Number.isNaN(next)) {
                  onTargetReadinessChange(DEFAULT_PLAN_TARGET_READINESS_PERCENT)
                  return
                }
                onTargetReadinessChange(Math.min(100, Math.max(50, next)))
              }}
              aria-label="Цель к экзамену в процентах"
              className={[planSettingsInputClass, 'pr-10'].join(' ')}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-text-tertiary">
              %
            </span>
          </div>
        </PlanSettingsField>
      </div>

      <fieldset>
        <legend className={`mb-2 ${planLabelClass}`}>Модули</legend>
        <div className="flex flex-wrap gap-2">
          {modules.map((mod) => {
            const active = selectedIds.has(mod.id)
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onToggleModule(mod.id)}
                className={[
                  'cursor-pointer rounded-full px-3 py-1.5 text-[14px] font-medium transition-colors',
                  active ? 'text-white' : 'bg-surface-subtle text-text-secondary hover:text-text-primary',
                ].join(' ')}
                style={active ? { backgroundColor: mod.color ?? PLAN_PURPLE } : undefined}
              >
                {mod.title}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-2 pb-1 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={!examDate || selectedIds.size === 0 || !isDirty}
          className={`${modulePrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          style={{ backgroundColor: PLAN_PURPLE }}
        >
          {hasPlan ? 'Обновить' : 'Сохранить'}
        </button>
        {hasPlan && onReset && (
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className={`${moduleGhostButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Очистить
          </button>
        )}
      </div>
    </div>
  )

  if (embedded) {
    return fields
  }

  return (
    <div className={embedded ? '' : planSurfaceClass}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-2 text-left text-[16px] font-semibold text-text-primary transition-colors hover:text-text-secondary"
      >
        <span>Настройки плана</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && <div className="mt-4">{fields}</div>}
    </div>
  )
}
