import type { Author } from './common'

export type DiagramMarkerType = 'point' | 'zone'
export type DiagramReviewMode = 'label-recall' | 'zone-pick'

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

export interface Diagram {
  id: string
  sourceDiagramId?: string
  ownerId?: string
  title: string
  description: string
  author: Author
  subject: string
  accent: string
  accentSoft: string
  updatedAt: string
  imageDataUrl: string
  markers: DiagramMarker[]
  reviewMode: DiagramReviewMode
}
