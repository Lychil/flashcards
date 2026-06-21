import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  Layers,
  LayoutDashboard,
  Map,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeSidebar, toggleSidebarCollapsed } from '../../store/slices/uiSlice'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'Обучение',
    items: [
      { to: '/', label: 'Главная', icon: LayoutDashboard, end: true },
      { to: '/library', label: 'Моя библиотека', icon: BookOpen },
      { to: '/diagrams', label: 'Интерактивные диаграммы', icon: Map, badge: '12' },
    ],
  },
  {
    title: 'Контент',
    items: [
      { to: '/collections', label: 'Подборки', icon: Layers, end: true },
    ],
  },
  {
    title: 'Аккаунт',
    items: [
      { to: '/subscription', label: 'Подписка', icon: CreditCard },
    ],
  },
]

const SIDEBAR_EXPANDED = 272
const SIDEBAR_COLLAPSED = 72

interface SidebarProps {
  mobile?: boolean
}

export function Sidebar({ mobile = false }: SidebarProps) {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector((state) => state.ui.sidebarCollapsed)

  const isCollapsed = !mobile && collapsed

  const handleNavClick = () => {
    if (mobile) dispatch(closeSidebar())
  }

  return (
    <aside
      style={{ width: mobile || !isCollapsed ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
      className={[
        'flex flex-col h-dvh bg-white shrink-0 overflow-hidden',
        'transition-[width] duration-300 ease-in-out',
        !mobile && 'hidden lg:flex border-r border-border-subtle',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div
        className={[
          'shrink-0 transition-all duration-300 ease-in-out',
          isCollapsed
            ? 'flex flex-col items-center gap-2 px-2 pt-5 pb-3'
            : 'flex items-center justify-between h-16 px-5',
        ].join(' ')}
      >
        <div
          className={[
            'flex items-center min-w-0 transition-all duration-300 ease-in-out',
            isCollapsed ? 'justify-center' : 'gap-2.5',
          ].join(' ')}
        >
          <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center shrink-0">
            <span className="text-[13px] font-semibold text-accent leading-none">M</span>
          </div>
          <span
            className={[
              'text-[15px] font-semibold text-text-primary whitespace-nowrap',
              'transition-all duration-300 ease-in-out overflow-hidden',
              isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[120px]',
            ].join(' ')}
          >
            Mnemo
          </span>
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={() => dispatch(closeSidebar())}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary"
            aria-label="Закрыть меню"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="p-1.5 rounded-lg text-text-tertiary hover:text-text-secondary hover:bg-surface-muted transition-all duration-300 ease-in-out shrink-0"
            aria-label={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {isCollapsed ? (
              <ChevronsRight size={16} strokeWidth={1.5} />
            ) : (
              <ChevronsLeft size={16} strokeWidth={1.5} />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={[
          'flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out',
          'px-4',
        ].join(' ')}
      >
        {navSections.map((section, index) => (
          <div
            key={section.title}
            className={[
              'transition-all duration-300 ease-in-out',
              index > 0 ? (isCollapsed ? 'mt-4' : 'mt-8') : 'mt-2',
            ].join(' ')}
          >
            <p
              className={[
                'font-semibold uppercase tracking-[0.08em] text-text-tertiary whitespace-nowrap',
                'transition-all duration-300 ease-in-out overflow-hidden',
                isCollapsed
                  ? 'opacity-0 h-0 mb-0 text-[0px] px-0'
                  : 'opacity-100 h-auto mb-3 text-[11px] px-3',
              ].join(' ')}
            >
              {section.title}
            </p>

            {isCollapsed && index > 0 && (
              <div className="mb-2 border-t border-border-subtle" />
            )}

            <ul className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end, badge }) => (
                <li key={to} className={isCollapsed ? 'flex justify-center' : undefined}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={handleNavClick}
                    title={isCollapsed ? label : undefined}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-lg text-[13px]',
                        'transition-all duration-300 ease-in-out',
                        isCollapsed
                          ? 'justify-center w-10 h-10 p-0'
                          : 'gap-3 px-3 py-2 w-full',
                        isActive
                          ? 'bg-accent-muted text-accent font-medium'
                          : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) =>
                      isCollapsed ? (
                        <Icon
                          size={18}
                          strokeWidth={1.5}
                          className={isActive ? 'text-accent' : 'text-text-tertiary'}
                        />
                      ) : (
                        <>
                          <Icon
                            size={18}
                            strokeWidth={1.5}
                            className={[
                              'shrink-0 transition-colors duration-200',
                              isActive ? 'text-accent' : 'text-text-tertiary',
                            ].join(' ')}
                          />
                          <span className="truncate whitespace-nowrap max-w-[160px]">
                            {label}
                          </span>
                          {badge && (
                            <span
                              className={[
                                'ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap',
                                isActive
                                  ? 'bg-badge text-accent'
                                  : 'bg-surface-muted text-text-secondary',
                              ].join(' ')}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )
                    }
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
