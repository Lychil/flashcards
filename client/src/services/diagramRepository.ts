import { mockDiagrams, type MockDiagram } from '../lib/mockDiagrams'
import { STORAGE_KEYS } from './storageKeys'

const CURRENT_USER_ID = '1'
const CURRENT_USER = { id: CURRENT_USER_ID, name: 'Александр' }

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function getLinkedDiagramCopyId(sourceDiagramId: string): string {
  return `copy-${sourceDiagramId}`
}

export const diagramRepository = {
  loadLibrary(): MockDiagram[] {
    return readJson<MockDiagram[]>(STORAGE_KEYS.userDiagrams) ?? []
  },

  save(diagram: MockDiagram): void {
    const existing = this.loadLibrary()
    const index = existing.findIndex((item) => item.id === diagram.id)
    const next =
      index >= 0
        ? existing.map((item, itemIndex) => (itemIndex === index ? diagram : item))
        : [...existing, diagram]
    localStorage.setItem(STORAGE_KEYS.userDiagrams, JSON.stringify(next))
  },

  findAny(id: string): MockDiagram | undefined {
    return this.loadLibrary().find((diagram) => diagram.id === id) ?? mockDiagrams.find((diagram) => diagram.id === id)
  },

  findLibraryCopy(sourceDiagramId: string): MockDiagram | undefined {
    const canonicalSourceId = this.findAny(sourceDiagramId)?.sourceDiagramId ?? sourceDiagramId
    return this.loadLibrary().find((diagram) => diagram.sourceDiagramId === canonicalSourceId)
  },

  copyToLibrary(sourceDiagramId: string): MockDiagram {
    const source = this.findAny(sourceDiagramId)
    if (!source) throw new Error('Diagram not found')

    const canonicalSourceId = source.sourceDiagramId ?? source.id
    const existing = this.findLibraryCopy(canonicalSourceId)
    if (existing) return existing

    const copy: MockDiagram = {
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

  create(diagram: Pick<MockDiagram, 'title' | 'description' | 'imageDataUrl' | 'markers'>): MockDiagram {
    const saved: MockDiagram = {
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

  update(diagramId: string, patch: Pick<MockDiagram, 'title' | 'description' | 'imageDataUrl' | 'markers'>): MockDiagram {
    const existing = this.loadLibrary().find((diagram) => diagram.id === diagramId)
    if (!existing) throw new Error('Diagram is not in library')

    const next: MockDiagram = {
      ...existing,
      ...patch,
      updatedAt: 'Только что',
    }
    this.save(next)
    return next
  },
}
