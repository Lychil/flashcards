import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { DiagramMarkerEditor } from '../../components/diagram/DiagramMarkerEditor'
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
    <div className="w-full max-w-[1400px] py-10 lg:py-14">
      <Link
        to="/create/diagram"
        className={[
          'inline-flex items-center gap-1.5 mb-8',
          'text-[13px] font-medium text-text-secondary',
          'hover:text-text-primary transition-colors duration-200',
        ].join(' ')}
      >
        <ArrowLeft size={15} strokeWidth={1.5} />
        Назад
      </Link>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary mb-3">
            Разметка
          </p>
          <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.03em] leading-[1.12] mb-1">
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
    </div>
  )
}
