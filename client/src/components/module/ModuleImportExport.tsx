import { Download, Upload, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import {
  downloadTextFile,
  exportCards,
  parseImportedCards,
  sanitizeFilename,
  type ExportFormat,
  type ImportMode,
  type ParsedImportCard,
} from '../../lib/moduleImportExport'
import type { Flashcard } from '../../types/flashcard'
import { moduleGhostButtonClass, moduleInteractiveClass } from './moduleStyles'

interface ModuleImportExportProps {
  moduleTitle: string
  cards: Flashcard[]
  onImport: (cards: ParsedImportCard[], mode: ImportMode) => void
}

const actionButtonClass = [
  moduleGhostButtonClass,
  'rounded-xl border border-border bg-white px-3 py-2 hover:bg-surface-subtle',
].join(' ')

export function ModuleImportExport({ moduleTitle, cards, onImport }: ModuleImportExportProps) {
  const [importOpen, setImportOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMode, setImportMode] = useState<ImportMode>('merge')
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importDialogId = useId()
  const exportMenuId = useId()
  const exportContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!exportOpen) return undefined

    const handlePointerDown = (e: PointerEvent) => {
      if (!exportContainerRef.current?.contains(e.target as Node)) {
        setExportOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [exportOpen])

  const handleExport = (format: ExportFormat) => {
    if (cards.length === 0) return
    const content = exportCards(cards, format)
    const base = sanitizeFilename(moduleTitle)
    const ext = format === 'csv' ? 'csv' : 'txt'
    const mime = format === 'csv' ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8'
    downloadTextFile(content, `${base}.${ext}`, mime)
    setExportOpen(false)
  }

  const handleImportSubmit = () => {
    const parsed = parseImportedCards(importText)
    if (parsed.length === 0) {
      setImportError('Не удалось распознать карточки. Используйте формат: термин<Tab>определение')
      return
    }
    onImport(parsed, importMode)
    setImportOpen(false)
    setImportText('')
    setImportError(null)
    setImportMode('merge')
  }

  const handleFileChange = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImportText(String(reader.result ?? ''))
      setImportError(null)
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Импорт"
          onClick={() => {
            setImportOpen(true)
            setImportError(null)
          }}
          className={[actionButtonClass, 'max-sm:px-2'].join(' ')}
        >
          <Upload size={15} strokeWidth={2} />
          <span className="hidden sm:inline">Импорт</span>
        </button>

        <div ref={exportContainerRef} className="relative">
          <button
            type="button"
            aria-label="Экспорт"
            aria-expanded={exportOpen}
            aria-haspopup="menu"
            aria-controls={exportMenuId}
            disabled={cards.length === 0}
            onClick={() => setExportOpen((prev) => !prev)}
            className={[
              actionButtonClass,
              'max-sm:px-2',
              'disabled:cursor-not-allowed disabled:opacity-40',
            ].join(' ')}
          >
            <Download size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Экспорт</span>
          </button>

          {exportOpen && (
            <ul
              id={exportMenuId}
              role="menu"
              className="absolute right-0 top-full z-30 mt-2 min-w-[220px] rounded-xl border border-border bg-white py-1.5"
            >
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleExport('tab')}
                  className="flex w-full cursor-pointer flex-col px-3.5 py-2.5 text-left hover:bg-surface-muted"
                >
                  <span className="text-[13px] font-medium text-text-primary">Tab (.txt)</span>
                  <span className="mt-0.5 text-[11px] text-text-tertiary">
                    Как в Quizlet — термин и определение через Tab
                  </span>
                </button>
              </li>
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleExport('csv')}
                  className="flex w-full cursor-pointer flex-col px-3.5 py-2.5 text-left hover:bg-surface-muted"
                >
                  <span className="text-[13px] font-medium text-text-primary">CSV (.csv)</span>
                  <span className="mt-0.5 text-[11px] text-text-tertiary">
                    Для Excel и Google Таблиц
                  </span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {importOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#12151a]/40 p-4"
          role="presentation"
          onClick={() => setImportOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={importDialogId}
            className="w-full max-w-lg rounded-2xl border border-border bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id={importDialogId} className="text-[18px] font-semibold text-text-primary">
                  Импорт карточек
                </h2>
                <p className="mt-1 text-[13px] text-text-secondary">
                  Вставьте текст или загрузите файл — как при импорте из Quizlet
                </p>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setImportOpen(false)}
                className={[
                  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-text-tertiary hover:bg-surface-subtle hover:text-text-primary',
                  moduleInteractiveClass,
                ].join(' ')}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                setImportError(null)
              }}
              placeholder={'Плечевая кость\tHumerus — кость плеча\nЛоктевая кость\tUlna — медиальная кость предплечья'}
              rows={8}
              className="w-full resize-y rounded-xl border border-border bg-surface-subtle/40 px-3.5 py-3 text-[14px] text-text-primary outline-none focus:border-[#d4d9e0] focus:bg-white focus:ring-2 focus:ring-[#6366f1]/15"
            />

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv,text/plain,text/csv"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={actionButtonClass}
              >
                Загрузить файл
              </button>
              <span className="text-[12px] text-text-tertiary">.txt или .csv</span>
            </div>

            <fieldset className="mt-4 space-y-2">
              <legend className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-text-secondary">
                Режим импорта
              </legend>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-primary">
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                />
                Добавить к существующим
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-text-primary">
                <input
                  type="radio"
                  name="import-mode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                />
                Заменить все карточки
              </label>
            </fieldset>

            {importError && (
              <p className="mt-3 text-[13px] font-medium text-[#b04472]">{importError}</p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setImportOpen(false)} className={actionButtonClass}>
                Отмена
              </button>
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={!importText.trim()}
                className={[
                  actionButtonClass,
                  'border-[#6366f1] bg-[#6366f1] text-white hover:bg-[#6366f1]/90 hover:opacity-100 disabled:opacity-40',
                ].join(' ')}
              >
                Импортировать
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
