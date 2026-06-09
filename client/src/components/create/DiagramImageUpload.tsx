import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const MAX_SIZE_BYTES = 10 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

interface DiagramImageUploadProps {
  file: File | null
  restoredPreviewUrl?: string | null
  onFileChange: (file: File | null) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Поддерживаются PNG, JPG, WebP и SVG'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Файл больше 10 МБ'
  }
  return null
}

export function DiagramImageUpload({
  file,
  restoredPreviewUrl = null,
  onFileChange,
}: DiagramImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl(restoredPreviewUrl)
  }, [file, restoredPreviewUrl])

  const applyFile = (nextFile: File | null) => {
    if (!nextFile) {
      onFileChange(null)
      setError(null)
      return
    }

    const validationError = validateFile(nextFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    onFileChange(nextFile)
  }

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0]
    if (nextFile) applyFile(nextFile)
  }

  const clearFile = () => {
    applyFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (previewUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        <div className="relative bg-surface-subtle">
          <img
            src={previewUrl}
            alt="Превью диаграммы"
            className="mx-auto max-h-[280px] w-full object-contain"
          />
          <button
            type="button"
            onClick={clearFile}
            aria-label="Удалить изображение"
            className={[
              'absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center',
              'rounded-lg border border-border bg-white text-text-secondary',
              'hover:text-text-primary hover:border-text-tertiary/40',
            ].join(' ')}
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-text-primary">
              {file?.name ?? 'Загруженное изображение'}
            </p>
            {file && (
              <p className="mt-0.5 text-[11px] text-text-tertiary">{formatFileSize(file.size)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 cursor-pointer text-[12px] font-medium text-text-secondary hover:text-text-primary"
          >
            Заменить
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOver(false)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={[
          'flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10',
          'bg-surface-subtle/60 transition-colors duration-200',
          dragOver
            ? 'border-accent bg-accent-muted'
            : 'border-border hover:border-text-tertiary/40 hover:bg-surface-subtle',
        ].join(' ')}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-white text-text-secondary">
          <ImagePlus size={18} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-text-primary">
            Перетащите файл или нажмите для выбора
          </p>
          <p className="mt-1 text-[11px] text-text-tertiary">PNG, JPG, WebP, SVG · до 10 МБ</p>
        </div>
      </button>
      {error && (
        <p className="mt-2 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
