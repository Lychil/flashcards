import { Menu } from 'lucide-react'
import { useAppDispatch } from '../../store/hooks'
import { toggleSidebar } from '../../store/slices/uiSlice'

export function MobileHeader() {
  const dispatch = useAppDispatch()

  return (
    <header className="lg:hidden shrink-0 flex items-center justify-between px-4 h-14 bg-white border-b border-border-subtle">
      <button
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary"
        aria-label="Открыть меню"
      >
        <Menu size={20} strokeWidth={1.5} />
      </button>
      <span className="text-[14px] font-semibold text-text-primary">Mnemo</span>
      <div className="w-9" />
    </header>
  )
}
