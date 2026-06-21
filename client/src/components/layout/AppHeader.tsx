import { Bell, LogOut, Menu, Settings, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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

const searchWidthClass = 'min-w-0 flex-1 sm:flex-initial sm:w-[600px] sm:max-w-[calc(100vw-12rem)]'

export function AppHeader() {
  const dispatch = useAppDispatch()
  const { data: user } = useGetCurrentUserQuery()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!profileOpen) return undefined

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (profileRef.current?.contains(target)) return
      setProfileOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileOpen])

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-white px-4 sm:gap-4 sm:px-6 lg:px-10">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
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

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            aria-label="Профиль"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className={[
              'flex h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2 transition-colors duration-200',
              'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
              profileOpen ? 'bg-surface-muted text-text-primary' : '',
            ].join(' ')}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-[13px] font-medium text-text-secondary">
              {user?.name?.charAt(0) ?? 'А'}
            </div>
            <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-text-primary xl:block">
              {user?.name ?? 'Пользователь'}
            </span>
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border-subtle bg-white p-2"
            >
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <User size={16} strokeWidth={1.75} />
                Профиль
              </Link>
              <Link
                to="/settings"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <Settings size={16} strokeWidth={1.75} />
                Настройки
              </Link>
              <Link
                to="/logout"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                <LogOut size={16} strokeWidth={1.75} />
                Выйти
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
