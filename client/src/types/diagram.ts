export type DiagramMarkerType = 'point' | 'zone'

export interface DiagramPoint {
  x: number
  y: number
}

export interface DiagramMarker {
  id: string
  type: DiagramMarkerType
  label: string
  hint: string
  x: number
  y: number
  points: DiagramPoint[]
  color?: string
}

export interface DiagramDraft {
  title: string
  description: string
  imageDataUrl: string | null
  markers: DiagramMarker[]
}
