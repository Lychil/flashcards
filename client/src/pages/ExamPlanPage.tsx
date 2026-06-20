import { Settings } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { ExamPlanCalendarGrid } from '../components/exam-plan/ExamPlanCalendarGrid'
import { ExamPlanOnboarding } from '../components/exam-plan/ExamPlanOnboarding'
import { ExamPlanReadinessRail } from '../components/exam-plan/ExamPlanReadinessSection'
import { ExamPlanSettingsModal } from '../components/exam-plan/ExamPlanSettingsModal'
import {
  planBlockClass,
  planBodyClass,
  planPageTitleClass,
  planSurfaceClass,
} from '../components/exam-plan/examPlanStyles'
import { moduleGhostButtonClass } from '../components/module/moduleStyles'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { useAllModulesCards } from '../hooks/useGlobalReviewQueue'
import { useExamPlan } from '../hooks/useExamPlan'
import { toDateKey } from '../lib/examPlan'

export function ExamPlanPage() {
  const { modules, cardsByModule } = useAllModulesCards()
  const { plan, schedule, setExamPlan } = useExamPlan(cardsByModule, modules)

  const modulesWithCards = modules.filter((m) => (cardsByModule[m.id]?.length ?? 0) > 0)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draftExamDate, setDraftExamDate] = useState('')
  const [draftGoalTitle, setDraftGoalTitle] = useState('')
  const [draftSelectedIds, setDraftSelectedIds] = useState<Set<string>>(new Set())

  const syncDraftFromSaved = useCallback(() => {
    if (plan) {
      setDraftExamDate(plan.examDate)
      setDraftGoalTitle(plan.goalTitle ?? '')
      setDraftSelectedIds(new Set(plan.moduleIds))
      return
    }

    setDraftExamDate('')
    setDraftGoalTitle('')
    setDraftSelectedIds(
      modulesWithCards.length > 0
        ? new Set(modulesWithCards.slice(0, 2).map((m) => m.id))
        : new Set(),
    )
  }, [plan, modulesWithCards])

  const isDraftDirty = useMemo(() => {
    if (!plan) {
      return Boolean(draftExamDate && draftSelectedIds.size > 0)
    }

    return (
      plan.examDate !== draftExamDate ||
      (plan.goalTitle ?? '') !== draftGoalTitle.trim() ||
      !sameSet(plan.moduleIds, draftSelectedIds)
    )
  }, [plan, draftExamDate, draftGoalTitle, draftSelectedIds])

  const hasUnsavedChanges = Boolean(plan && isDraftDirty)

  const minDate = toDateKey()
  const hasCalendar = Boolean(schedule)

  const openSettings = () => {
    syncDraftFromSaved()
    setSettingsOpen(true)
  }

  const closeSettings = () => {
    syncDraftFromSaved()
    setSettingsOpen(false)
  }

  const toggleModule = (id: string) => {
    setDraftSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    if (!draftExamDate || draftSelectedIds.size === 0) return
    setExamPlan(draftExamDate, [...draftSelectedIds], draftGoalTitle)
    setSettingsOpen(false)
  }

  const handleResetChanges = () => {
    syncDraftFromSaved()
  }

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[{ label: 'Главная', to: '/' }, { label: 'План подготовки' }]}
        className="mb-5"
      />

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] xl:gap-8">
        <div className="flex min-w-0 items-center justify-between gap-3 xl:col-start-1 xl:row-start-1">
          <h1 className={`min-w-0 ${planPageTitleClass}`}>План подготовки</h1>
          <button
            type="button"
            onClick={openSettings}
            className={[
              moduleGhostButtonClass,
              'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium',
              settingsOpen && isDraftDirty ? 'border-accent/30 bg-accent-muted/40 text-accent' : '',
            ].join(' ')}
          >
            <Settings size={15} strokeWidth={2} />
            Настроить план
          </button>
        </div>

        {schedule && (
          <aside className="hidden min-w-0 xl:col-start-2 xl:row-start-1 xl:row-span-2 xl:block xl:sticky xl:top-6 xl:self-start">
            <ExamPlanReadinessRail forecast={schedule.forecast} goalTitle={plan?.goalTitle} />
          </aside>
        )}

        <div className="flex min-w-0 w-full flex-col items-start xl:col-start-1 xl:row-start-2">
          <ExamPlanOnboarding variant={hasCalendar ? 'active' : 'setup'} />

          {schedule && (
            <div className="mb-5 w-full xl:hidden">
              <ExamPlanReadinessRail forecast={schedule.forecast} goalTitle={plan?.goalTitle} />
            </div>
          )}

          {hasCalendar && schedule ? (
            <section className={`${planBlockClass} w-full overflow-visible`}>
              <ExamPlanCalendarGrid
                days={schedule.days}
                rangeFrom={schedule.calendarFrom}
                rangeTo={schedule.calendarTo}
              />
            </section>
          ) : (
            <section className={`${planSurfaceClass} w-full px-5 py-6`}>
              <p className={planBodyClass}>
                Нажмите «Настроить план», укажите дату экзамена и модули — календарь построится
                здесь автоматически.
              </p>
            </section>
          )}
        </div>
      </div>

      <ExamPlanSettingsModal
        open={settingsOpen}
        onClose={closeSettings}
        examDate={draftExamDate}
        goalTitle={draftGoalTitle}
        selectedIds={draftSelectedIds}
        modules={modulesWithCards}
        minDate={minDate}
        isDirty={isDraftDirty}
        hasPlan={Boolean(plan)}
        canReset={hasUnsavedChanges}
        onExamDateChange={setDraftExamDate}
        onGoalTitleChange={setDraftGoalTitle}
        onToggleModule={toggleModule}
        onSave={handleSave}
        onReset={handleResetChanges}
      />
    </PageLayout>
  )
}

function sameSet(a: string[], b: Set<string>): boolean {
  if (a.length !== b.size) return false
  return a.every((id) => b.has(id))
}
