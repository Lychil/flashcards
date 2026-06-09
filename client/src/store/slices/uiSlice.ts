import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
}

const getInitialCollapsed = (): boolean => {
  return localStorage.getItem('sidebarCollapsed') === 'true'
}

const initialState: UiState = {
  sidebarOpen: false,
  sidebarCollapsed: getInitialCollapsed(),
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openSidebar(state) {
      state.sidebarOpen = true
    },
    closeSidebar(state) {
      state.sidebarOpen = false
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarCollapsed(state, action: { payload: boolean }) {
      state.sidebarCollapsed = action.payload
      localStorage.setItem('sidebarCollapsed', String(action.payload))
    },
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
      localStorage.setItem('sidebarCollapsed', String(state.sidebarCollapsed))
    },
  },
})

export const {
  openSidebar,
  closeSidebar,
  toggleSidebar,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
} = uiSlice.actions
export default uiSlice.reducer
