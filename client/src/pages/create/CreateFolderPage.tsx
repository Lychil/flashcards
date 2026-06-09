import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreatePageShell } from '../../components/create/CreatePageShell'
import { FormField, TextArea, TextInput } from '../../components/create/FormField'
import { Button } from '../../components/ui/Button'

export function CreateFolderPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  return (
    <CreatePageShell
      eyebrow="Создание"
      title="Новая папка"
      description="Соберите модули в папку по предмету, теме или своей логике."
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <FormField label="Название" hint="Например: Биология · ЕГЭ">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Введите название папки"
            autoFocus
            required
          />
        </FormField>

        <FormField label="Описание" hint="Необязательно. Поможет вспомнить, что внутри.">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Кратко опишите содержимое папки"
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={!name.trim()}>
            Создать папку
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Отмена
          </Button>
        </div>
      </form>
    </CreatePageShell>
  )
}
