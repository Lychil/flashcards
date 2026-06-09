import { configureStore } from '@reduxjs/toolkit'
import { modulesApi } from './api/modulesApi'
import diagramDraftReducer from './slices/diagramDraftSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    diagramDraft: diagramDraftReducer,
    [modulesApi.reducerPath]: modulesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(modulesApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
