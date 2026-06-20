import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { Module } from '../../types/module'
import { moduleGhostButtonClass, modulePrimaryButtonClass } from '../module/moduleStyles'
import { textFieldInputClass } from '../ui/SearchBar'
import { PLAN_PURPLE, planLabelClass, planSurfaceClass } from './examPlanStyles'

interface ExamPlanSettingsProps {
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
  defaultOpen?: boolean
  embedded?: boolean
}

export function ExamPlanSettings({
  examDate,
  goalTitle,
  selectedIds,
  modules,
  minDate,
  isDirty,
  hasPlan,
  onExamDateChange,
  onGoalTitleChange,
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
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block min-w-0">
          <span className={`mb-1.5 block ${planLabelClass}`}>Дата экзамена</span>
          <input
            type="date"
            value={examDate}
            min={minDate}
            onChange={(e) => onExamDateChange(e.target.value)}
            className={textFieldInputClass}
          />
        </label>

        <label className="block min-w-0 sm:col-span-1">
          <span className={`mb-1.5 block ${planLabelClass}`}>Цель плана</span>
          <input
            type="text"
            value={goalTitle}
            onChange={(e) => onGoalTitleChange(e.target.value)}
            placeholder="Например: уверенно сдать экзамен по анатомии"
            maxLength={120}
            className={textFieldInputClass}
          />
        </label>
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

      <div className="flex flex-wrap gap-2 pt-1">
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
