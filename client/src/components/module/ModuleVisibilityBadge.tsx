import { Lock, LockOpen } from 'lucide-react'
import { isModulePublic, moduleVisibilityLabel } from '../../lib/moduleVisibility'
import type { Module } from '../../types/module'
import { Tooltip } from '../ui/Tooltip'

interface ModuleVisibilityBadgeProps {
  module: Module
  variant?: 'overlay' | 'inline'
  className?: string
}

export function ModuleVisibilityBadge({
  module,
  variant = 'overlay',
  className = '',
}: ModuleVisibilityBadgeProps) {
  const isPublic = isModulePublic(module)
  const Icon = isPublic ? LockOpen : Lock
  const label = moduleVisibilityLabel(module)

  if (variant === 'overlay') {
    return (
      <Tooltip label={label} side="bottom" align="start">
        <span
          className={[
            'inline-flex items-center justify-center rounded-full bg-black/18 p-1.5 backdrop-blur-sm ring-1 ring-inset ring-white/20',
            className,
          ].join(' ')}
          aria-label={label}
        >
          <Icon size={12} strokeWidth={2} className="text-white/95" aria-hidden />
        </span>
      </Tooltip>
    )
  }

  return (
    <Tooltip label={label} side="bottom" align="start">
      <span
        className={[
          'inline-flex items-center justify-center rounded-full bg-surface-subtle px-2 py-0.5 text-text-secondary',
          className,
        ].join(' ')}
        aria-label={label}
      >
        <Icon size={12} strokeWidth={2} aria-hidden />
      </span>
    </Tooltip>
  )
}
