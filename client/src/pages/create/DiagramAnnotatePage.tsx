import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { DiagramMarkerEditor } from '../../components/diagram/DiagramMarkerEditor'
import { PageBreadcrumbs } from '../../components/layout/PageBreadcrumbs'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button } from '../../components/ui/Button'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearDiagramDraft, setDiagramMarkers } from '../../store/slices/diagramDraftSlice'
import type { DiagramMarker } from '../../types/diagram'

export function DiagramAnnotatePage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.diagramDraft)
  const [markers, setMarkers] = useState<DiagramMarker[]>(draft.markers)

  useEffect(() => {
    setMarkers(draft.markers)
  }, [draft.markers])

  if (!draft.imageDataUrl) {
    return <Navigate to="/create/diagram" replace />
  }

  const handleMarkersChange = (next: DiagramMarker[]) => {
    setMarkers(next)
    dispatch(setDiagramMarkers(next))
  }

  const labeledCount = markers.filter((m) => m.label.trim()).length
  const canSave = markers.length > 0 && labeledCount === markers.length

  const handleSave = () => {
    dispatch(clearDiagramDraft())
    navigate('/diagrams')
  }

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Создание', to: '/create/diagram' },
          { label: 'Разметка' },
        ]}
        className="mb-8"
      />

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="mb-1 text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-text-primary">
            {draft.title || 'Новая диаграмма'}
          </h1>
          {draft.description && (
            <p className="text-[14px] text-text-secondary leading-relaxed">{draft.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[12px] text-text-tertiary tabular-nums">
            {labeledCount}/{markers.length} с названием
          </span>
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            Сохранить диаграмму
          </Button>
        </div>
      </header>

      <DiagramMarkerEditor
        imageUrl={draft.imageDataUrl}
        markers={markers}
        onChange={handleMarkersChange}
      />
    </PageLayout>
  )
}
