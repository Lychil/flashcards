import { pluralizeRu } from '../../lib/pluralizeRu'
import type { LibraryFolder } from '../../types/library'
import { MODULE_CARD_HEIGHT, MODULE_INFO_HEIGHT, MODULE_PANEL_HEIGHT } from './ModuleCard'

export const FOLDER_CARD_WIDTH = 240
export const FOLDER_CARD_HEIGHT = MODULE_CARD_HEIGHT

const FOLDER_H = 178
const FOLDER_BODY_COLOR = '#F0D875'
const FOLDER_LID_COLOR = '#E3C454'
const GAP_TOP = 8
const LID_H = 16
const LID_INSET = 20

function pluralizeModules(count: number): string {
  return pluralizeRu(count, ['модуль', 'модуля', 'модулей'])
}

interface FolderCardProps {
  folder: LibraryFolder
  previewColors?: string[]
  onClick?: () => void
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative flex cursor-pointer flex-col text-left',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6366f1]',
      ].join(' ')}
      style={{ width: FOLDER_CARD_WIDTH, height: FOLDER_CARD_HEIGHT }}
    >
      <div
        className="relative flex shrink-0 items-end justify-center pb-3"
        style={{ height: MODULE_PANEL_HEIGHT }}
      >
        <div className="relative w-full" style={{ height: FOLDER_H }} aria-hidden>
          <div
            className="absolute inset-x-0 bottom-0 rounded-[14px]"
            style={{ top: GAP_TOP, backgroundColor: FOLDER_BODY_COLOR }}
          />
          <div
            className="absolute z-10 rounded-[6px] border border-[#C9AD3D]/50 shadow-[0_1px_2px_rgba(26,29,33,0.06)]"
            style={{
              top: GAP_TOP,
              left: LID_INSET,
              right: LID_INSET,
              height: LID_H,
              backgroundColor: FOLDER_LID_COLOR,
            }}
          />
        </div>
      </div>

      <div
        className="flex shrink-0 flex-col justify-center pt-2.5"
        style={{ height: MODULE_INFO_HEIGHT }}
      >
        <h3 className="mb-1 line-clamp-1 text-[14px] font-semibold leading-tight tracking-[-0.02em] text-text-primary">
          {folder.name}
        </h3>
        <p className="line-clamp-1 text-[11px] text-text-tertiary">
          {folder.moduleCount} {pluralizeModules(folder.moduleCount)}
        </p>
      </div>
    </button>
  )
}
