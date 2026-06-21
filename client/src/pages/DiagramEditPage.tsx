import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DiagramMarkerEditor } from '../components/diagram/DiagramMarkerEditor'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { Button } from '../components/ui/Button'
import { FormField, TextArea, TextInput } from '../components/create/FormField'
import { diagramRepository } from '../services/diagramRepository'
import type { DiagramMarker } from '../types/diagram'

export function DiagramEditPage() {
  const { diagramId = '' } = useParams()
  const navigate = useNavigate()
  const diagram = diagramRepository.findAny(diagramId)
  const [title, setTitle] = useState(diagram?.title ?? '')
  const [description, setDescription] = useState(diagram?.description ?? '')
  const [markers, setMarkers] = useState<DiagramMarker[]>(diagram?.markers ?? [])

  if (!diagram) {
    return <Navigate to="/diagrams" replace />
  }

  if (!diagram.ownerId) {
    return <Navigate to={`/diagrams/${diagram.id}`} replace />
  }

  const labeledCount = markers.filter((marker) => marker.label.trim()).length
  const canSave = title.trim().length > 0 && markers.length > 0 && labeledCount === markers.length

  const handleSave = () => {
    if (!canSave) return

    diagramRepository.update(diagram.id, {
      title: title.trim(),
      description: description.trim(),
      imageDataUrl: diagram.imageDataUrl,
      markers,
    })
    navigate(`/diagrams/${diagram.id}`)
  }

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Библиотека', to: '/library' },
          { label: diagram.title, to: `/diagrams/${diagram.id}` },
          { label: 'Редактирование' },
        ]}
        className="mb-8"
      />

      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid w-full max-w-3xl gap-4">
          <FormField label="Название">
            <TextInput
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Название диаграммы"
            />
          </FormField>
          <FormField label="Описание">
            <TextArea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Краткое описание"
            />
          </FormField>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[12px] text-text-tertiary tabular-nums">
            {labeledCount}/{markers.length} с названием
          </span>
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </header>

      <DiagramMarkerEditor
        imageUrl={diagram.imageDataUrl}
        markers={markers}
        onChange={setMarkers}
      />
    </PageLayout>
  )
}
