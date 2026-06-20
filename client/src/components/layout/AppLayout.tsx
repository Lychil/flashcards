import { Outlet } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { closeSidebar } from '../../store/slices/uiSlice'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      <Sidebar />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => dispatch(closeSidebar())}
          />
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar mobile />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-w-0 min-h-0 bg-white">
        <AppHeader />
        <main className="flex-1 min-h-0 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
