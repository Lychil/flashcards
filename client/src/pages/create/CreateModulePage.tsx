import { FileText, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreatePageShell } from '../../components/create/CreatePageShell'
import { FormField, TextArea, TextInput } from '../../components/create/FormField'
import { Button } from '../../components/ui/Button'
import type { ModuleType } from '../../types/module'

export function CreateModulePage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<ModuleType>('text')

  return (
    <CreatePageShell
      eyebrow="Создание"
      title="Новый модуль"
      description="Создайте набор карточек для запоминания терминов, формул или фактов."
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <FormField label="Название">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Органическая химия"
            autoFocus
            required
          />
        </FormField>

        <FormField label="Категория" hint="Предмет или раздел, к которому относится модуль.">
          <TextInput
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Химия"
            required
          />
        </FormField>

        <FormField label="Описание">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Кратко опишите, что входит в модуль"
          />
        </FormField>

        <FormField label="Тип модуля">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('text')}
              className={[
                'flex flex-col items-start gap-3 rounded-xl border p-4 text-left cursor-pointer transition-colors duration-200',
                type === 'text'
                  ? 'border-accent bg-accent-muted'
                  : 'border-border bg-white hover:border-text-tertiary/40',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  type === 'text' ? 'bg-accent text-white' : 'bg-surface-muted text-text-secondary',
                ].join(' ')}
              >
                <FileText size={16} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-primary">Текстовый</p>
                <p className="mt-1 text-[11px] leading-snug text-text-tertiary">
                  Классические карточки со словами
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType('interactive')}
              className={[
                'flex flex-col items-start gap-3 rounded-xl border p-4 text-left cursor-pointer transition-colors duration-200',
                type === 'interactive'
                  ? 'border-accent bg-accent-muted'
                  : 'border-border bg-white hover:border-text-tertiary/40',
              ].join(' ')}
            >
              <div
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  type === 'interactive' ? 'bg-accent text-white' : 'bg-surface-muted text-text-secondary',
                ].join(' ')}
              >
                <ImageIcon size={16} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-text-primary">Интерактивный</p>
                <p className="mt-1 text-[11px] leading-snug text-text-tertiary">
                  Карточки с изображением и зонами
                </p>
              </div>
            </button>
          </div>
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={!title.trim() || !category.trim()}>
            Создать модуль
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Отмена
          </Button>
        </div>
      </form>
    </CreatePageShell>
  )
}
