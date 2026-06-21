import {
  AlertCircle,
  Check,
  FileText,
  Link2,
  Loader2,
  Sparkles,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreatePageShell } from '../../components/create/CreatePageShell'
import { FormField, TextArea, TextInput } from '../../components/create/FormField'
import { moduleGhostButtonClass, modulePrimaryButtonClass } from '../../components/module/moduleStyles'
import { Button } from '../../components/ui/Button'
import { EmptyPlaceholder } from '../../components/ui/ContentPlaceholder'
import { Toast } from '../../components/ui/Toast'
import { ensureCardSrs } from '../../lib/enrichFlashcards'
import { isTrivialGeneratedCard } from '../../lib/aiCardHeuristics'
import { createDefaultSrs } from '../../lib/spacedRepetition'
import { startAiGeneration } from '../../services/aiGenerationService'
import { cardRepository } from '../../services/cardRepository'
import { generationQuotaRepository } from '../../services/generationQuotaRepository'
import { userModuleRepository } from '../../services/userModuleRepository'
import type { AiGenerationInput, AiGenerationPhase, GeneratedCard } from '../../types/aiGeneration'
import type { Flashcard } from '../../types/flashcard'
import type { Module } from '../../types/module'

type InputMode = 'text' | 'file' | 'url'

export function CreateAiModulePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const genHandleRef = useRef<{ cancel: () => void } | null>(null)

  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)

  const [phase, setPhase] = useState<AiGenerationPhase>('idle')
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [quota, setQuota] = useState(() => generationQuotaRepository.load())

  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleCategory, setModuleCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTerm, setEditTerm] = useState('')
  const [editDefinition, setEditDefinition] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => genHandleRef.current?.cancel()
  }, [])

  const acceptedCards = generatedCards.filter((c) => c.status === 'accepted')
  const pendingCards = generatedCards.filter((c) => c.status === 'pending')

  const canGenerate =
    quota.used < quota.limit &&
    ((inputMode === 'text' && text.trim().length > 10) ||
      (inputMode === 'file' && fileContent) ||
      (inputMode === 'url' && url.trim().length > 5))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setFileContent(String(reader.result ?? ''))
    }
    reader.readAsText(file)
  }

  const buildInput = (): AiGenerationInput => {
    if (inputMode === 'text') return { text }
    if (inputMode === 'file') return { fileName: fileName ?? undefined, fileContent: fileContent ?? undefined }
    return { url }
  }

  const handleGenerate = () => {
    if (!canGenerate) return

    genHandleRef.current?.cancel()
    setPhase('generating')
    setGeneratedCards([])
    setErrorMessage(null)

    const nextQuota = generationQuotaRepository.incrementUsed()
    setQuota(nextQuota)

    genHandleRef.current = startAiGeneration(buildInput(), {
      onCard(card) {
        setGeneratedCards((prev) => [...prev, card])
      },
      onComplete(cards) {
        if (cards.length === 0) {
          setPhase('empty')
        } else {
          setPhase('done')
        }
      },
      onError(message) {
        setErrorMessage(message)
        setPhase('error')
      },
    })
  }

  const setCardStatus = (id: string, status: GeneratedCard['status']) => {
    setGeneratedCards((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const acceptAll = () => {
    setGeneratedCards((prev) => prev.map((c) => (c.status === 'pending' ? { ...c, status: 'accepted' } : c)))
  }

  const rejectAllTrivial = () => {
    setGeneratedCards((prev) =>
      prev.map((c) =>
        c.status === 'pending' && isTrivialGeneratedCard(c.term, c.definition)
          ? { ...c, status: 'rejected' }
          : c,
      ),
    )
  }

  const trivialCount = generatedCards.filter(
    (c) => c.status === 'pending' && isTrivialGeneratedCard(c.term, c.definition),
  ).length

  const startEdit = (card: GeneratedCard) => {
    setEditingId(card.id)
    setEditTerm(card.term)
    setEditDefinition(card.definition)
  }

  const saveEdit = () => {
    if (!editingId) return
    setGeneratedCards((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, term: editTerm.trim(), definition: editDefinition.trim(), status: 'accepted' }
          : c,
      ),
    )
    setEditingId(null)
  }

  const handleSaveModule = () => {
    const toSave = generatedCards.filter((c) => c.status === 'accepted')
    if (!moduleTitle.trim() || !moduleCategory.trim() || toSave.length === 0) return

    const moduleId = `ai-${Date.now()}`
    const flashcards: Flashcard[] = toSave.map((c, i) =>
      ensureCardSrs({
        id: `${moduleId}-${i}`,
        term: c.term,
        definition: c.definition,
        sourceRef: c.sourceRef,
        srs: createDefaultSrs(),
      }),
    )

    const mod: Module = {
      id: moduleId,
      title: moduleTitle.trim(),
      description: `Сгенерировано ИИ из ${toSave[0]?.sourceRef.sourceLabel ?? 'материала'}`,
      previewWords: flashcards.slice(0, 4).map((c) => c.term),
      wordCount: flashcards.length,
      category: moduleCategory.trim(),
      progress: 0,
      type: 'text',
      color: '#9B8AFB',
      author: { id: '1', name: 'Александр' },
      favoriteCount: 0,
      rating: 0,
      lastReviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    userModuleRepository.save(mod)
    cardRepository.saveCards(moduleId, flashcards)
    setToastMessage(`Модуль «${mod.title}» сохранён — ${flashcards.length} карточек`)
    setTimeout(() => navigate(`/module/${moduleId}`), 800)
  }

  const resetFlow = () => {
    genHandleRef.current?.cancel()
    setPhase('idle')
    setGeneratedCards([])
    setErrorMessage(null)
    setText('')
    setUrl('')
    setFileName(null)
    setFileContent(null)
  }

  return (
    <CreatePageShell
      eyebrow="Создание"
      title="Модуль с помощью ИИ"
      description="Загрузите материал — приложение сгенерирует набор карточек. Каждая карточка будет связана с фрагментом исходного текста."
    >
      <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-surface-subtle px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] text-text-secondary">
          <Sparkles size={16} strokeWidth={2} className="text-[#9B8AFB]" />
          <span>
            Использовано{' '}
            <strong className="font-semibold text-text-primary">
              {quota.used} из {quota.limit}
            </strong>{' '}
            генераций
          </span>
        </div>
        {quota.used >= quota.limit && (
          <span className="text-[12px] font-medium text-[#b04472]">Лимит исчерпан</span>
        )}
      </div>

      {phase === 'idle' && (
        <>
          <div className="mb-5 flex gap-2">
            {(
              [
                { id: 'text' as const, label: 'Текст', icon: FileText },
                { id: 'file' as const, label: 'Файл', icon: Upload },
                { id: 'url' as const, label: 'Ссылка', icon: Link2 },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setInputMode(id)}
                className={[
                  'flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-medium transition-colors',
                  inputMode === id
                    ? 'border-accent bg-accent-muted text-text-primary'
                    : 'border-border bg-white text-text-secondary hover:border-text-tertiary/40',
                ].join(' ')}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </button>
            ))}
          </div>

          {inputMode === 'text' && (
            <FormField label="Материал" hint="Вставьте текст с терминами и определениями (строки вида «термин — определение»).">
              <TextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={'Митохондрия — органелла клетки, «энергетическая станция»\nФотосинтез — процесс образования органики из CO₂ и воды\nДНК — молекула, хранящая генетическую информацию'}
                rows={8}
              />
            </FormField>
          )}

          {inputMode === 'file' && (
            <FormField label="Файл" hint="Поддерживаются текстовые файлы (.txt, .md, .csv).">
              <input ref={fileInputRef} type="file" accept=".txt,.md,.csv,text/*" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-white px-6 py-8 text-center transition-colors hover:border-text-tertiary/40 hover:bg-surface-subtle"
              >
                <Upload size={24} strokeWidth={1.5} className="text-text-tertiary" />
                {fileName ? (
                  <span className="text-[14px] font-medium text-text-primary">{fileName}</span>
                ) : (
                  <span className="text-[14px] text-text-secondary">Нажмите, чтобы выбрать файл</span>
                )}
              </button>
            </FormField>
          )}

          {inputMode === 'url' && (
            <FormField label="Ссылка" hint="Укажите URL страницы с учебным материалом.">
              <TextInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                type="url"
              />
            </FormField>
          )}

          <div className="mt-6 flex gap-3">
            <Button onClick={handleGenerate} disabled={!canGenerate}>
              <Sparkles size={15} strokeWidth={2} />
              Сгенерировать карточки
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>
              Отмена
            </Button>
          </div>
        </>
      )}

      {phase === 'generating' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-surface-subtle px-4 py-4">
            <Loader2 size={20} strokeWidth={2} className="animate-spin text-[#9B8AFB]" />
            <div>
              <p className="text-[14px] font-semibold text-text-primary">Генерация карточек…</p>
              <p className="text-[13px] text-text-secondary">
                Создано {generatedCards.length}{pendingCards.length > 0 ? ' — добавляем ещё' : ''}
              </p>
            </div>
          </div>

          {generatedCards.length > 0 && (
            <GeneratedCardPreviewList cards={generatedCards} readonly />
          )}
        </div>
      )}

      {phase === 'error' && (
        <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-5 py-6 text-center">
          <AlertCircle size={32} strokeWidth={1.5} className="mx-auto mb-3 text-[#ef4444]" />
          <p className="text-[16px] font-semibold text-text-primary">Не удалось сгенерировать</p>
          <p className="mt-2 text-[14px] text-text-secondary">{errorMessage}</p>
          <button type="button" onClick={resetFlow} className={`${modulePrimaryButtonClass} mt-5`}>
            Попробовать снова
          </button>
        </div>
      )}

      {phase === 'empty' && (
        <EmptyPlaceholder
          variant="compact"
          title="Карточки не найдены"
          description="Не удалось извлечь пары «термин — определение» из материала. Попробуйте другой формат."
          action={
            <button type="button" onClick={resetFlow} className={modulePrimaryButtonClass}>
              Изменить материал
            </button>
          }
        />
      )}

      {phase === 'done' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-text-secondary">
              Примите или отредактируйте карточки перед сохранением
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={acceptAll} className={moduleGhostButtonClass}>
                Принять все
              </button>
              {trivialCount > 0 && (
                <button type="button" onClick={rejectAllTrivial} className={moduleGhostButtonClass}>
                  Отсеять тривиальные ({trivialCount})
                </button>
              )}
              <button type="button" onClick={resetFlow} className={moduleGhostButtonClass}>
                Заново
              </button>
            </div>
          </div>

          <GeneratedCardPreviewList
            cards={generatedCards}
            editingId={editingId}
            editTerm={editTerm}
            editDefinition={editDefinition}
            onEditTerm={setEditTerm}
            onEditDefinition={setEditDefinition}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={() => setEditingId(null)}
            onAccept={(id) => setCardStatus(id, 'accepted')}
            onReject={(id) => setCardStatus(id, 'rejected')}
          />

          <div className="rounded-2xl border border-border bg-surface-subtle p-5">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
              Сохранить модуль
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Название">
                <TextInput
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Например: Биология — клетка"
                />
              </FormField>
              <FormField label="Категория">
                <TextInput
                  value={moduleCategory}
                  onChange={(e) => setModuleCategory(e.target.value)}
                  placeholder="Биология"
                />
              </FormField>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveModule}
                disabled={acceptedCards.length === 0 || !moduleTitle.trim() || !moduleCategory.trim()}
                className={`${modulePrimaryButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                Сохранить ({acceptedCards.length} карточек)
              </button>
              <span className="text-[13px] text-text-secondary">
                Модуль сразу подключится к системе повторения
              </span>
            </div>
          </div>
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </CreatePageShell>
  )
}

interface GeneratedCardPreviewListProps {
  cards: GeneratedCard[]
  readonly?: boolean
  editingId?: string | null
  editTerm?: string
  editDefinition?: string
  onEditTerm?: (v: string) => void
  onEditDefinition?: (v: string) => void
  onStartEdit?: (card: GeneratedCard) => void
  onSaveEdit?: () => void
  onCancelEdit?: () => void
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
}

function GeneratedCardPreviewList({
  cards,
  readonly,
  editingId,
  editTerm = '',
  editDefinition = '',
  onEditTerm,
  onEditDefinition,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onAccept,
  onReject,
}: GeneratedCardPreviewListProps) {
  return (
    <ul className="space-y-2">
      {cards.map((card, index) => {
        const isEditing = editingId === card.id
        const isRejected = card.status === 'rejected'
        const isTrivial = isTrivialGeneratedCard(card.term, card.definition)

        return (
          <li
            key={card.id}
            className={[
              'rounded-2xl border border-border px-4 py-4 transition-opacity',
              isRejected ? 'bg-surface-subtle opacity-50' : 'bg-white',
              card.status === 'accepted' && !readonly ? 'ring-1 ring-[#6BC9A7]/30' : '',
            ].join(' ')}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <span className="text-[12px] font-semibold tabular-nums text-text-tertiary">
                {index + 1}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {isTrivial && !isRejected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F5B84C]/15 px-2 py-0.5 text-[11px] font-semibold text-[#9a6b12]">
                    Вероятно тривиальная
                  </span>
                )}
                {!readonly && card.status === 'accepted' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#6BC9A7]/15 px-2 py-0.5 text-[11px] font-semibold text-[#2d8a66]">
                    <Check size={12} strokeWidth={2.5} />
                    Принята
                  </span>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input
                  value={editTerm}
                  onChange={(e) => onEditTerm?.(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-[14px] font-semibold outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                />
                <textarea
                  value={editDefinition}
                  onChange={(e) => onEditDefinition?.(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border px-3 py-2 text-[14px] outline-none focus:ring-2 focus:ring-[#6366f1]/20"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={onSaveEdit} className={modulePrimaryButtonClass}>
                    Сохранить
                  </button>
                  <button type="button" onClick={onCancelEdit} className={moduleGhostButtonClass}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[15px] font-semibold text-text-primary">{card.term}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-text-secondary">{card.definition}</p>
              </>
            )}

            <SourceRefBadge sourceRef={card.sourceRef} className="mt-3" />

            {!readonly && !isEditing && card.status !== 'rejected' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onAccept?.(card.id)}
                  className={[
                    moduleGhostButtonClass,
                    card.status === 'accepted' ? 'bg-[#6BC9A7]/15 text-[#2d8a66]' : '',
                  ].join(' ')}
                >
                  <Check size={14} strokeWidth={2} />
                  Принять
                </button>
                <button type="button" onClick={() => onStartEdit?.(card)} className={moduleGhostButtonClass}>
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => onReject?.(card.id)}
                  className={`${moduleGhostButtonClass} hover:text-[#b04472]`}
                >
                  <X size={14} strokeWidth={2} />
                  Отклонить
                </button>
              </div>
            )}

            {!readonly && isRejected && (
              <button
                type="button"
                onClick={() => onAccept?.(card.id)}
                className={`${moduleGhostButtonClass} mt-3`}
              >
                Вернуть
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function SourceRefBadge({
  sourceRef,
  className = '',
}: {
  sourceRef: GeneratedCard['sourceRef']
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-xl bg-surface-subtle px-3 py-2',
        className,
      ].join(' ')}
      title={sourceRef.excerpt}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-text-tertiary">
        Источник · {sourceRef.sourceLabel}
      </p>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-text-secondary">
        «{sourceRef.excerpt}»
      </p>
    </div>
  )
}
