import { mockDiagrams } from '../lib/mockDiagrams'
import type { Diagram } from '../types/diagram'
import { STORAGE_KEYS } from './storageKeys'
import { readJson, writeJson } from './storageUtils'

const CURRENT_USER_ID = '1'
const CURRENT_USER = { id: CURRENT_USER_ID, name: 'Александр' }

export function getLinkedDiagramCopyId(sourceDiagramId: string): string {
  return `copy-${sourceDiagramId}`
}

export const diagramRepository = {
  loadLibrary(): Diagram[] {
    return readJson<Diagram[]>(STORAGE_KEYS.userDiagrams) ?? []
  },

  save(diagram: Diagram): void {
    const existing = this.loadLibrary()
    const index = existing.findIndex((item) => item.id === diagram.id)
    const next =
      index >= 0
        ? existing.map((item, itemIndex) => (itemIndex === index ? diagram : item))
        : [...existing, diagram]
    writeJson(STORAGE_KEYS.userDiagrams, next)
  },

  findAny(id: string): Diagram | undefined {
    return this.loadLibrary().find((diagram) => diagram.id === id) ?? mockDiagrams.find((diagram) => diagram.id === id)
  },

  findLibraryCopy(sourceDiagramId: string): Diagram | undefined {
    const canonicalSourceId = this.findAny(sourceDiagramId)?.sourceDiagramId ?? sourceDiagramId
    return this.loadLibrary().find((diagram) => diagram.sourceDiagramId === canonicalSourceId)
  },

  copyToLibrary(sourceDiagramId: string): Diagram {
    const source = this.findAny(sourceDiagramId)
    if (!source) throw new Error('Diagram not found')

    const canonicalSourceId = source.sourceDiagramId ?? source.id
    const existing = this.findLibraryCopy(canonicalSourceId)
    if (existing) return existing

    const copy: Diagram = {
      ...source,
      id: getLinkedDiagramCopyId(canonicalSourceId),
      sourceDiagramId: canonicalSourceId,
      ownerId: CURRENT_USER_ID,
      author: CURRENT_USER,
      updatedAt: 'Только что',
      markers: source.markers.map((marker) => ({
        ...marker,
        points: marker.points.map((point) => ({ ...point })),
      })),
    }

    this.save(copy)
    return copy
  },

  create(diagram: Pick<Diagram, 'title' | 'description' | 'imageDataUrl' | 'markers'>): Diagram {
    const saved: Diagram = {
      ...diagram,
      id: `diagram-${Date.now()}`,
      ownerId: CURRENT_USER_ID,
      author: CURRENT_USER,
      subject: 'Моя диаграмма',
      accent: '#0A1225',
      accentSoft: '#F5F7FA',
      updatedAt: 'Только что',
      reviewMode: diagram.markers.some((marker) => marker.type === 'zone') ? 'zone-pick' : 'label-recall',
    }
    this.save(saved)
    return saved
  },

  update(diagramId: string, patch: Pick<Diagram, 'title' | 'description' | 'imageDataUrl' | 'markers'>): Diagram {
    const existing = this.loadLibrary().find((diagram) => diagram.id === diagramId)
    if (!existing) throw new Error('Diagram is not in library')

    const next: Diagram = {
      ...existing,
      ...patch,
      updatedAt: 'Только что',
    }
    this.save(next)
    return next
  },
}
