import { Bell, Menu, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { useGetCurrentUserQuery } from '../../store/api/modulesApi'
import { CreateDropdown } from '../ui/CreateDropdown'
import { AppGlobalSearch } from './AppGlobalSearch'
import { AppNotificationsPopup, hasUnreadNotifications } from './AppNotificationsPopup'

const iconButtonClass = [
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
  'text-text-secondary transition-colors duration-200',
  'hover:bg-surface-muted hover:text-text-primary',
].join(' ')

const navActionClass = ({ isActive }: { isActive: boolean }) =>
  [
    iconButtonClass,
    isActive ? 'bg-surface-muted text-text-primary' : '',
  ].join(' ')

const searchWidthClass = 'w-full sm:w-[600px] sm:max-w-[calc(100vw-12rem)]'

export function AppHeader() {
  const dispatch = useAppDispatch()
  const { data: user } = useGetCurrentUserQuery()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!notificationsOpen) return undefined

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (notificationsRef.current?.contains(target)) return
      setNotificationsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [notificationsOpen])

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-white px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          className={`${iconButtonClass} lg:hidden`}
          aria-label="Открыть меню"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>

        <div className={searchWidthClass}>
          <AppGlobalSearch />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <CreateDropdown />

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label="Уведомления"
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            className={`${iconButtonClass} relative`}
          >
            <Bell size={18} strokeWidth={1.5} />
            {hasUnreadNotifications() && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" aria-hidden />
            )}
          </button>

          <AppNotificationsPopup open={notificationsOpen} />
        </div>

        <NavLink
          to="/profile"
          aria-label="Профиль"
          className={[
            'flex h-10 items-center gap-2.5 rounded-xl px-2 transition-colors duration-200',
            'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
          ].join(' ')}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-[13px] font-medium text-text-secondary">
            {user?.name?.charAt(0) ?? 'А'}
          </div>
          <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-text-primary xl:block">
            {user?.name ?? 'Пользователь'}
          </span>
        </NavLink>

        <NavLink to="/settings" aria-label="Настройки" className={navActionClass}>
          <Settings size={18} strokeWidth={1.5} />
        </NavLink>
      </div>
    </header>
  )
}
