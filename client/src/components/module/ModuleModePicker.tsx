import { ChevronRight } from 'lucide-react'
import { pluralizeCards } from '../../lib/pluralizeRu'
import { STUDY_MODE_GROUPS, STUDY_MODES, type StudyModeId } from '../../types/studyMode'
import { homeCardClass, homeInteractiveClass } from '../home/homeStyles'

interface ModuleModePickerProps {
  cardCount: number
  moduleAccent: string
  onSelect: (mode: StudyModeId) => void
}

export function ModuleModePicker({ cardCount, moduleAccent, onSelect }: ModuleModePickerProps) {
  const availableCount = STUDY_MODES.filter((mode) => cardCount >= mode.minCards).length

  return (
    <div id="study-modes" className="scroll-mt-6 space-y-8">
      <div
        className={`relative overflow-hidden px-6 py-6 sm:px-8 sm:py-7 ${homeCardClass}`}
        style={{
          background: `linear-gradient(135deg, ${moduleAccent}16 0%, #ffffff 60%)`,
        }}
      >
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Методы заучивания
        </p>
        <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-text-primary sm:text-[28px]">
          Как хотите учить?
        </h2>
        <p className="mt-2 max-w-[520px] text-[14px] leading-relaxed text-text-secondary">
          Нажмите на карточку ниже — {availableCount} из {STUDY_MODES.length} режимов доступны для
          этого модуля.
        </p>
      </div>

      {STUDY_MODE_GROUPS.map((group) => {
        const modes = STUDY_MODES.filter((mode) => mode.group === group.id)

        return (
          <section key={group.id}>
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
              {group.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {modes.map((mode) => {
                const disabled = cardCount < mode.minCards
                const Icon = mode.icon

                return (
                  <button
                    key={mode.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(mode.id)}
                    className={[
                      'group relative flex cursor-pointer items-start gap-4 rounded-[20px] border border-border bg-white p-4 text-left',
                      homeInteractiveClass,
                      disabled
                        ? 'cursor-not-allowed opacity-45 hover:border-border'
                        : 'hover:border-[#d4d9e0] hover:shadow-[var(--shadow-card-hover)]',
                    ].join(' ')}
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${mode.accent}18`, color: mode.accent }}
                    >
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-[15px] font-semibold text-text-primary">{mode.title}</p>
                        {!disabled && (
                          <ChevronRight
                            size={16}
                            className="shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-text-secondary"
                          />
                        )}
                      </div>
                      <p className="text-[13px] leading-relaxed text-text-secondary">
                        {mode.description}
                      </p>
                      {disabled && (
                        <p className="mt-2 text-[11px] font-medium text-text-tertiary">
                          Нужно минимум {mode.minCards} {pluralizeCards(mode.minCards)}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
