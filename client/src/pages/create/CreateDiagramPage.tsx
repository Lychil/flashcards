import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreatePageShell } from '../../components/create/CreatePageShell'
import { DiagramImageUpload } from '../../components/create/DiagramImageUpload'
import { FormField, TextArea, TextInput } from '../../components/create/FormField'
import { Button } from '../../components/ui/Button'
import { readFileAsDataUrl } from '../../lib/readFileAsDataUrl'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setDiagramDraft } from '../../store/slices/diagramDraftSlice'

export function CreateDiagramPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.diagramDraft)

  const [title, setTitle] = useState(draft.title)
  const [description, setDescription] = useState(draft.description)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasImage = Boolean(imageFile || draft.imageDataUrl)

  const handleContinue = async () => {
    if (!title.trim() || !hasImage) return

    setIsSubmitting(true)
    try {
      const imageDataUrl = imageFile
        ? await readFileAsDataUrl(imageFile)
        : draft.imageDataUrl!

      dispatch(
        setDiagramDraft({
          title: title.trim(),
          description: description.trim(),
          imageDataUrl,
          markers: draft.imageDataUrl === imageDataUrl ? draft.markers : [],
        }),
      )
      navigate('/create/diagram/annotate')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CreatePageShell
      eyebrow="Создание"
      title="Новая диаграмма"
      description="Загрузите схему и отметьте зоны, которые нужно запомнить."
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          void handleContinue()
        }}
      >
        <FormField label="Название">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Строение клетки"
            autoFocus
            required
          />
        </FormField>

        <FormField label="Описание">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="О чём эта диаграмма и для чего она нужна"
          />
        </FormField>

        <FormField
          label="Изображение"
          hint="После загрузки перейдёте к разметке точек и зон."
        >
          <DiagramImageUpload
            file={imageFile}
            restoredPreviewUrl={!imageFile ? draft.imageDataUrl : null}
            onFileChange={(file) => {
              setImageFile(file)
              if (!file) {
                dispatch(
                  setDiagramDraft({
                    ...draft,
                    imageDataUrl: null,
                    markers: [],
                  }),
                )
              }
            }}
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={!title.trim() || !hasImage || isSubmitting}>
            {isSubmitting ? 'Загрузка...' : 'Далее: разметить'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Отмена
          </Button>
        </div>
      </form>
    </CreatePageShell>
  )
}
