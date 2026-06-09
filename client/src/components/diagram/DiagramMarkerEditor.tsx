import { Circle, MapPin, Pentagon, Trash2, Undo2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DIAGRAM_ZONE_COLORS, getDefaultZoneColor, hexToRgba } from '../../lib/diagramColor'
import type { DiagramMarker, DiagramPoint } from '../../types/diagram'
import { FormField, TextInput } from '../create/FormField'
import { Button } from '../ui/Button'

type EditorMode = 'point' | 'zone'

interface DiagramMarkerEditorProps {
  imageUrl: string
  markers: DiagramMarker[]
  onChange: (markers: DiagramMarker[]) => void
}

interface DraggingVertex {
  markerId: string
  pointIndex: number
}

const MIN_POLYGON_POINTS = 3

function createMarkerId(): string {
  return crypto.randomUUID()
}

function getRelativeCoords(
  clientX: number,
  clientY: number,
  element: HTMLElement,
): DiagramPoint {
  const rect = element.getBoundingClientRect()
  return {
    x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
  }
}

function pointsToSvg(points: DiagramPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

function resolveZoneColor(marker: DiagramMarker, zoneIndex: number): string {
  return marker.color ?? getDefaultZoneColor(zoneIndex)
}

export function DiagramMarkerEditor({
  imageUrl,
  markers,
  onChange,
}: DiagramMarkerEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const draggingVertexRef = useRef<DraggingVertex | null>(null)
  const [mode, setMode] = useState<EditorMode>('point')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [polygonDraft, setPolygonDraft] = useState<DiagramPoint[]>([])
  const [cursorPoint, setCursorPoint] = useState<DiagramPoint | null>(null)
  const [draggingVertex, setDraggingVertex] = useState<DraggingVertex | null>(null)

  const selectedMarker = markers.find((m) => m.id === selectedId) ?? null
  const zoneMarkers = markers.filter(
    (m) => m.type === 'zone' && m.points.length >= MIN_POLYGON_POINTS,
  )

  const addMarker = useCallback(
    (marker: Omit<DiagramMarker, 'id' | 'label' | 'hint'>) => {
      const next: DiagramMarker = {
        id: createMarkerId(),
        label: '',
        hint: '',
        ...marker,
      }
      onChange([...markers, next])
      setSelectedId(next.id)
    },
    [markers, onChange],
  )

  const updateMarker = useCallback(
    (id: string, patch: Partial<DiagramMarker>) => {
      onChange(markers.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    },
    [markers, onChange],
  )

  const updateZonePoint = useCallback(
    (markerId: string, pointIndex: number, coords: DiagramPoint) => {
      onChange(
        markers.map((m) => {
          if (m.id !== markerId || m.type !== 'zone') return m
          const points = m.points.map((p, i) => (i === pointIndex ? coords : p))
          return { ...m, points }
        }),
      )
    },
    [markers, onChange],
  )

  const removeMarker = useCallback(
    (id: string) => {
      onChange(markers.filter((m) => m.id !== id))
      if (selectedId === id) setSelectedId(null)
    },
    [markers, onChange, selectedId],
  )

  const cancelPolygonDraft = useCallback(() => {
    setPolygonDraft([])
    setCursorPoint(null)
  }, [])

  const finishPolygon = useCallback(() => {
    if (polygonDraft.length < MIN_POLYGON_POINTS) return

    const zoneCount = markers.filter((m) => m.type === 'zone').length
    addMarker({
      type: 'zone',
      x: 0,
      y: 0,
      points: polygonDraft,
      color: getDefaultZoneColor(zoneCount),
    })
    setPolygonDraft([])
    setCursorPoint(null)
  }, [addMarker, markers, polygonDraft])

  const switchMode = (nextMode: EditorMode) => {
    setMode(nextMode)
    cancelPolygonDraft()
  }

  useEffect(() => {
    draggingVertexRef.current = draggingVertex
  }, [draggingVertex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (draggingVertexRef.current) return
      if (mode !== 'zone' || polygonDraft.length === 0) return

      if (e.key === 'Escape') {
        e.preventDefault()
        cancelPolygonDraft()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mode, polygonDraft, cancelPolygonDraft])

  useEffect(() => {
    if (!draggingVertex) return

    const handlePointerMove = (e: PointerEvent) => {
      if (!canvasRef.current) return
      const coords = getRelativeCoords(e.clientX, e.clientY, canvasRef.current)
      updateZonePoint(draggingVertex.markerId, draggingVertex.pointIndex, coords)
    }

    const handlePointerUp = () => {
      setDraggingVertex(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [draggingVertex, updateZonePoint])

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || draggingVertexRef.current) return
    if ((e.target as HTMLElement).closest('[data-marker]')) return
    if ((e.target as HTMLElement).closest('[data-vertex]')) return
    if ((e.target as HTMLElement).closest('[data-draft-start]')) return

    const coords = getRelativeCoords(e.clientX, e.clientY, canvasRef.current)

    if (mode === 'point') {
      addMarker({
        type: 'point',
        x: coords.x,
        y: coords.y,
        points: [],
      })
      return
    }

    setPolygonDraft((prev) => [...prev, coords])
    setSelectedId(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingVertex) return
    if (mode !== 'zone' || polygonDraft.length === 0 || !canvasRef.current) {
      setCursorPoint(null)
      return
    }
    setCursorPoint(getRelativeCoords(e.clientX, e.clientY, canvasRef.current))
  }

  const startVertexDrag = (
    markerId: string,
    pointIndex: number,
    e: React.PointerEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedId(markerId)
    setDraggingVertex({ markerId, pointIndex })
    cancelPolygonDraft()
  }

  const undoLastPolygonPoint = () => {
    setPolygonDraft((prev) => prev.slice(0, -1))
  }

  const draftPreviewPoints =
    cursorPoint && polygonDraft.length > 0
      ? [...polygonDraft, cursorPoint]
      : polygonDraft

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => switchMode('point')}
            className={[
              'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors duration-200',
              mode === 'point'
                ? 'border-accent bg-accent-muted text-accent'
                : 'border-border bg-white text-text-secondary hover:border-text-tertiary/40',
            ].join(' ')}
          >
            <MapPin size={14} strokeWidth={1.5} />
            Точка
          </button>
          <button
            type="button"
            onClick={() => switchMode('zone')}
            className={[
              'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors duration-200',
              mode === 'zone'
                ? 'border-accent bg-accent-muted text-accent'
                : 'border-border bg-white text-text-secondary hover:border-text-tertiary/40',
            ].join(' ')}
          >
            <Pentagon size={14} strokeWidth={1.5} />
            Зона
          </button>
          <span className="text-[12px] text-text-tertiary">
            {mode === 'point'
              ? 'Кликните на изображение — точки ставятся поверх зон'
              : 'Кликайте по углам. Замкните фигуру кликом по первой точке'}
          </span>
        </div>

        {mode === 'zone' && polygonDraft.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-text-secondary tabular-nums">
              {polygonDraft.length} т.
              {polygonDraft.length >= MIN_POLYGON_POINTS && ' · кликните по первой точке'}
            </span>
            <Button type="button" size="sm" variant="secondary" onClick={undoLastPolygonPoint}>
              <Undo2 size={14} strokeWidth={1.5} />
              Отменить точку
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelPolygonDraft}>
              Отмена
            </Button>
          </div>
        )}

        {selectedMarker?.type === 'zone' && polygonDraft.length === 0 && (
          <p className="mb-3 text-[12px] text-text-tertiary">
            Перетащите белые точки на углах, чтобы изменить форму зоны.
          </p>
        )}

        <div
          ref={canvasRef}
          className={[
            'relative w-full overflow-hidden rounded-xl border border-border bg-surface-subtle',
            draggingVertex ? 'cursor-grabbing' : 'cursor-crosshair',
          ].join(' ')}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCursorPoint(null)}
        >
          <img
            src={imageUrl}
            alt="Диаграмма для разметки"
            className="block h-auto max-h-[80vh] w-full select-none"
            draggable={false}
          />

          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1 1"
            preserveAspectRatio="none"
          >
            {zoneMarkers.map((marker, index) => {
              const isSelected = marker.id === selectedId
              const color = resolveZoneColor(marker, index)
              return (
                <polygon
                  key={marker.id}
                  points={pointsToSvg(marker.points)}
                  fill={hexToRgba(color, isSelected ? 0.32 : 0.2)}
                  stroke={hexToRgba(color, isSelected ? 0.95 : 0.7)}
                  strokeWidth={isSelected ? 0.005 : 0.004}
                />
              )
            })}

            {draftPreviewPoints.length >= 2 && (
              <polyline
                points={pointsToSvg(draftPreviewPoints)}
                fill="none"
                stroke="rgba(10, 18, 37, 0.75)"
                strokeWidth={0.003}
                strokeDasharray="0.01 0.008"
              />
            )}

            {polygonDraft.length >= MIN_POLYGON_POINTS && (
              <polygon
                points={pointsToSvg(polygonDraft)}
                fill="rgba(10, 18, 37, 0.08)"
                stroke="rgba(10, 18, 37, 0.45)"
                strokeWidth={0.003}
                strokeDasharray="0.008 0.006"
              />
            )}
          </svg>

          {polygonDraft.map((point, index) => {
            const isStartPoint = index === 0
            const canClose = isStartPoint && polygonDraft.length >= MIN_POLYGON_POINTS

            const dotClass = [
              'block h-2 w-2 rounded-full border',
              isStartPoint ? 'border-accent bg-white' : 'border-white bg-accent',
            ].join(' ')

            if (canClose) {
              return (
                <button
                  key={`draft-${index}`}
                  type="button"
                  data-draft-start
                  onClick={(e) => {
                    e.stopPropagation()
                    finishPolygon()
                  }}
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center p-1.5"
                  style={{
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                  }}
                  aria-label="Замкнуть зону"
                >
                  <span className={dotClass} />
                </button>
              )
            }

            return (
              <span
                key={`draft-${index}`}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${point.x * 100}%`,
                  top: `${point.y * 100}%`,
                }}
              >
                <span className={dotClass} />
              </span>
            )
          })}

          {selectedMarker?.type === 'zone' &&
            polygonDraft.length === 0 &&
            selectedMarker.points.map((point, index) => (
              <button
                key={`vertex-${index}`}
                type="button"
                data-vertex
                onPointerDown={(e) => startVertexDrag(selectedMarker.id, index, e)}
                className={[
                  'absolute z-20 flex -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center p-1.5',
                  draggingVertex?.markerId === selectedMarker.id &&
                  draggingVertex.pointIndex === index
                    ? 'scale-110'
                    : '',
                ].join(' ')}
                style={{
                  left: `${point.x * 100}%`,
                  top: `${point.y * 100}%`,
                }}
                aria-label={`Угол ${index + 1}`}
              >
                <span
                  className={[
                    'block h-2 w-2 rounded-full border border-white',
                    draggingVertex?.markerId === selectedMarker.id &&
                    draggingVertex.pointIndex === index
                      ? 'bg-accent'
                      : 'bg-white',
                  ].join(' ')}
                  style={{
                    boxShadow: `0 0 0 1.5px ${resolveZoneColor(
                      selectedMarker,
                      zoneMarkers.findIndex((m) => m.id === selectedMarker.id),
                    )}`,
                  }}
                />
              </button>
            ))}

          {markers
            .filter((m) => m.type === 'point')
            .map((marker, index) => {
              const isSelected = marker.id === selectedId
              return (
                <button
                  key={marker.id}
                  type="button"
                  data-marker
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(marker.id)
                  }}
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center"
                  style={{
                    left: `${marker.x * 100}%`,
                    top: `${marker.y * 100}%`,
                  }}
                  aria-label={marker.label || `Точка ${index + 1}`}
                >
                  <span
                    className={[
                      'flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-semibold tabular-nums',
                      isSelected
                        ? 'border-accent bg-accent text-white'
                        : 'border-white bg-accent text-white',
                    ].join(' ')}
                  >
                    {index + 1}
                  </span>
                </button>
              )
            })}
        </div>
      </div>

      <aside className="w-full shrink-0 xl:w-[280px]">
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-text-primary">
              Метки · {markers.length}
            </h3>
          </div>

          {markers.length === 0 ? (
            <p className="text-[12px] leading-relaxed text-text-tertiary">
              Точки — для столиц и отдельных объектов. Зоны-многоугольники — для органов,
              регионов и сложных областей на схеме.
            </p>
          ) : (
            <ul className="mb-4 flex max-h-[280px] flex-col gap-1 overflow-y-auto">
              {markers.map((marker, index) => {
                const zoneIndex = zoneMarkers.findIndex((m) => m.id === marker.id)
                const swatchColor =
                  marker.type === 'zone' && zoneIndex >= 0
                    ? resolveZoneColor(marker, zoneIndex)
                    : null

                return (
                  <li key={marker.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(marker.id)
                        cancelPolygonDraft()
                      }}
                      className={[
                        'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150',
                        selectedId === marker.id
                          ? 'bg-accent-muted text-accent'
                          : 'hover:bg-surface-muted',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
                          swatchColor ? '' : 'bg-surface-muted text-text-secondary',
                        ].join(' ')}
                        style={
                          swatchColor
                            ? { backgroundColor: hexToRgba(swatchColor, 0.25) }
                            : undefined
                        }
                      >
                        {swatchColor ? (
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: swatchColor }}
                          />
                        ) : (
                          <MapPin size={12} strokeWidth={1.5} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium">
                          {marker.label || `Метка ${index + 1}`}
                        </span>
                        <span className="block text-[10px] text-text-tertiary">
                          {marker.type === 'point'
                            ? 'Точка'
                            : `Зона · ${marker.points.length} т.`}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {selectedMarker ? (
            <div className="space-y-3 border-t border-border-subtle pt-4">
              <FormField
                label="Название"
                hint="Что нужно запомнить: «Париж», «Печень», «Митохондрия»"
              >
                <TextInput
                  value={selectedMarker.label}
                  onChange={(e) => updateMarker(selectedMarker.id, { label: e.target.value })}
                  placeholder="Введите название"
                  autoFocus
                />
              </FormField>

              <FormField label="Подсказка" hint="Необязательно. Контекст для повторения.">
                <TextInput
                  value={selectedMarker.hint}
                  onChange={(e) => updateMarker(selectedMarker.id, { hint: e.target.value })}
                  placeholder="Например: столица Франции"
                />
              </FormField>

              {selectedMarker.type === 'zone' && (
                <FormField label="Цвет зоны">
                  <div className="flex flex-wrap gap-2">
                    {DIAGRAM_ZONE_COLORS.map((color) => {
                      const isActive =
                        (selectedMarker.color ??
                          getDefaultZoneColor(
                            zoneMarkers.findIndex((m) => m.id === selectedMarker.id),
                          )) === color
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateMarker(selectedMarker.id, { color })}
                          className={[
                            'h-7 w-7 cursor-pointer rounded-full border-2 transition-transform duration-150',
                            isActive
                              ? 'scale-110 border-accent'
                              : 'border-white hover:scale-105',
                          ].join(' ')}
                          style={{ backgroundColor: color }}
                          aria-label={`Цвет ${color}`}
                        />
                      )
                    })}
                  </div>
                </FormField>
              )}

              <button
                type="button"
                onClick={() => removeMarker(selectedMarker.id)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-text-secondary hover:text-red-600"
              >
                <Trash2 size={13} strokeWidth={1.5} />
                Удалить метку
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 border-t border-border-subtle pt-4 text-[12px] text-text-tertiary">
              <Circle size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <p>Выберите метку в списке, чтобы редактировать. Зоны не блокируют новые точки.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
