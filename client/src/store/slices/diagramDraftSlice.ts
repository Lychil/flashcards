import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DiagramDraft, DiagramMarker } from '../../types/diagram'

const initialState: DiagramDraft = {
  title: '',
  description: '',
  imageDataUrl: null,
  markers: [],
}

const diagramDraftSlice = createSlice({
  name: 'diagramDraft',
  initialState,
  reducers: {
    setDiagramDraft(_state, action: PayloadAction<DiagramDraft>) {
      return action.payload
    },
    setDiagramMarkers(state, action: PayloadAction<DiagramMarker[]>) {
      state.markers = action.payload
    },
    clearDiagramDraft() {
      return initialState
    },
  },
})

export const { setDiagramDraft, setDiagramMarkers, clearDiagramDraft } = diagramDraftSlice.actions
export default diagramDraftSlice.reducer
