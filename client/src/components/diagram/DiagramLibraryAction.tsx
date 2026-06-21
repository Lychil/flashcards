import { Copy, Library, Pencil } from 'lucide-react'
import type { ReactElement } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { diagramRepository } from '../../services/diagramRepository'
import { Tooltip } from '../ui/Tooltip'

interface DiagramLibraryActionProps {
  diagramId: string
  variant?: 'copy' | 'edit'
  display?: 'button' | 'icon'
  className?: string
  onChange?: () => void
}

export function DiagramLibraryAction({
  diagramId,
  variant = 'copy',
  display = 'button',
  className = '',
  onChange,
}: DiagramLibraryActionProps) {
  const navigate = useNavigate()
  const diagram = diagramRepository.findAny(diagramId)
  const canonicalSourceId = diagram?.sourceDiagramId ?? diagramId
  const existingCopy = diagramRepository.findLibraryCopy(canonicalSourceId)
  const isLibraryDiagram = Boolean(diagram?.ownerId)
  const isIcon = display === 'icon'
  const iconClass = [
    'flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-text-secondary',
    'transition-colors hover:bg-surface-subtle hover:text-text-primary',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    className,
  ].filter(Boolean).join(' ')
  const buttonClass = [
    'inline-flex items-center justify-center gap-2 rounded-full bg-surface-subtle px-4 py-2.5',
    'text-[13px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary',
    className,
  ].filter(Boolean).join(' ')
  const renderWithTooltip = (label: string, action: ReactElement) =>
    isIcon ? (
      <Tooltip label={label} side="top">
        {action}
      </Tooltip>
    ) : action

  if (variant === 'edit' || isLibraryDiagram) {
    return renderWithTooltip(
      'Редактировать',
      <Link
        to={`/diagrams/${diagramId}/edit`}
        className={isIcon ? iconClass : buttonClass}
        aria-label="Редактировать диаграмму"
      >
        <Pencil size={15} strokeWidth={2} />
        {!isIcon && 'Редактировать'}
      </Link>,
    )
  }

  if (existingCopy) {
    return renderWithTooltip(
      'В библиотеке',
      <Link
        to={`/diagrams/${existingCopy.id}`}
        className={isIcon ? iconClass : buttonClass}
        aria-label="Диаграмма уже в библиотеке"
      >
        <Library size={15} strokeWidth={2} />
        {!isIcon && 'В библиотеке'}
      </Link>,
    )
  }

  return renderWithTooltip(
    'В мою библиотеку',
    <button
      type="button"
      onClick={() => {
        const copy = diagramRepository.copyToLibrary(diagramId)
        onChange?.()
        navigate(`/diagrams/${copy.id}`)
      }}
      className={[isIcon ? iconClass : buttonClass, 'cursor-pointer'].join(' ')}
      aria-label="Добавить диаграмму в библиотеку"
    >
      <Copy size={15} strokeWidth={2} />
      {!isIcon && 'В мою библиотеку'}
    </button>,
  )
}
