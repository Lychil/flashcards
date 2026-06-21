import type { ReactNode } from 'react'
import { Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCardColorTheme, resolveModuleBaseColor } from '../../lib/cardColor'
import { isModuleLinkedCopy, isModuleOwner } from '../../lib/moduleAccess'
import { getStudyModeById, type StudyModeId } from '../../types/studyMode'
import type { Module } from '../../types/module'
import type { BreadcrumbItem } from '../layout/PageBreadcrumbs'
import { PageBreadcrumbs } from '../layout/PageBreadcrumbs'
import { Tooltip } from '../ui/Tooltip'
import { useGetModuleQuery } from '../../store/api/modulesApi'
import { ModuleFavoriteAction } from './ModuleFavoriteAction'
import { ModuleRatingAction } from './ModuleRatingPanel'
import { ModuleVisibilityBadge } from './ModuleVisibilityBadge'

interface ModulePageHeaderProps {
  module: Module
  currentUserId?: string
  hideBreadcrumbs?: boolean
  variant?: 'default' | 'compact'
  headerActions?: ReactNode
  className?: string
}

function favoriteTooltip(count: number): string {
  const formatted = count.toLocaleString('ru-RU')
  const abs = Math.abs(count)
  const mod100 = abs % 100
  const mod10 = abs % 10

  if (mod100 >= 11 && mod100 <= 14) return `${formatted} добавлений в избранное`
  if (mod10 === 1) return `${formatted} добавление в избранное`
  if (mod10 >= 2 && mod10 <= 4) return `${formatted} добавления в избранное`
  return `${formatted} добавлений в избранное`
}

function MetricItem({
  tooltip,
  icon,
  value,
}: {
  tooltip: string
  icon: ReactNode
  value: ReactNode
}) {
  return (
    <Tooltip label={tooltip} side="bottom" align="end">
      <span className="inline-flex cursor-default items-center gap-1 text-text-primary">
        {icon}
        <span className="text-[13px] font-semibold tabular-nums leading-none">{value}</span>
      </span>
    </Tooltip>
  )
}

export function getModuleBreadcrumbItems(
  module: Module,
  activeMode?: StudyModeId | null,
): BreadcrumbItem[] {
  const activeModeMeta = getStudyModeById(activeMode)

  return [
    { label: 'Библиотека', to: '/library' },
    ...(activeMode
      ? [{ label: module.title, to: `/module/${module.id}` }]
      : [{ label: module.title }]),
    ...(activeModeMeta ? [{ label: activeModeMeta.title }] : []),
  ]
}

export function ModulePageHeader({
  module,
  currentUserId,
  hideBreadcrumbs = false,
  variant = 'default',
  headerActions,
  className = '',
}: ModulePageHeaderProps) {
  const accent = getCardColorTheme(resolveModuleBaseColor(module.id, module.color)).base
  const isLinkedCopy = isModuleLinkedCopy(module)
  const isSelf = isModuleOwner(module, currentUserId)
  const { data: sourceDetail } = useGetModuleQuery(module.sourceModuleId ?? '', {
    skip: !isLinkedCopy || !module.sourceModuleId,
  })
  const displayAuthor = isLinkedCopy && sourceDetail ? sourceDetail.module.author : module.author
  const metricsModule = isLinkedCopy && sourceDetail ? sourceDetail.module : module
  const breadcrumbItems = getModuleBreadcrumbItems(module)
  const isCompact = variant === 'compact'

  return (
    <header className={[isCompact ? 'mb-6' : 'mb-8', className].filter(Boolean).join(' ')}>
      {!hideBreadcrumbs && <PageBreadcrumbs items={breadcrumbItems} className="mb-5" />}

      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-[12px]"
          style={{ color: accent, backgroundColor: `${accent}18` }}
        >
          {module.category}
        </span>
        <ModuleVisibilityBadge module={module} variant="inline" />
        {isLinkedCopy && module.sourceModuleId && (
          <Link
            to={`/module/${module.sourceModuleId}`}
            className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary sm:text-[12px]"
          >
            Копия · оригинал
          </Link>
        )}
        <span className="text-[11px] font-medium text-text-tertiary sm:text-[12px]">
          {module.type === 'interactive' ? 'Интерактивный' : 'Текстовый'}
        </span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1
          className={[
            'min-w-0 flex-1 font-bold leading-tight tracking-[-0.03em] text-text-primary',
            isCompact ? 'text-[20px] sm:text-[22px]' : 'text-[26px] sm:text-[32px]',
          ].join(' ')}
        >
          {module.title}
        </h1>
        {headerActions}
      </div>

      <div className="mt-4">
        {module.description && (
          <p
            className={[
              'leading-relaxed text-text-secondary',
              isCompact ? 'text-[13px] sm:text-[14px]' : 'text-[14px] sm:text-[15px]',
            ].join(' ')}
          >
            {module.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <div
              className={[
                'flex items-center justify-center rounded-full font-bold text-white',
                isCompact ? 'h-9 w-9 text-[12px]' : 'h-10 w-10 text-[13px]',
              ].join(' ')}
              style={{ backgroundColor: accent }}
              title={isLinkedCopy ? displayAuthor.name : isSelf ? 'Вы' : displayAuthor.name}
            >
              {isLinkedCopy
                ? displayAuthor.name.charAt(0)
                : isSelf
                  ? 'Вы'
                  : displayAuthor.name.charAt(0)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-text-primary sm:text-[14px]">
                {isLinkedCopy ? displayAuthor.name : isSelf ? 'Ваш модуль' : displayAuthor.name}
              </p>
              <p className="text-[11px] text-text-tertiary sm:text-[12px]">
                {isLinkedCopy ? 'Автор оригинала' : 'Автор'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-4">
              <MetricItem
                tooltip={favoriteTooltip(metricsModule.favoriteCount)}
                icon={<Heart size={13} strokeWidth={2} className="fill-red-500 text-red-500" aria-hidden />}
                value={metricsModule.favoriteCount.toLocaleString('ru-RU')}
              />
              <MetricItem
                tooltip={
                  metricsModule.rating > 0
                    ? `Средняя оценка модуля: ${metricsModule.rating.toFixed(1)} из 5`
                    : 'Пока без оценок'
                }
                icon={
                  <Star
                    size={13}
                    strokeWidth={2}
                    className="fill-[#F5B84C] text-[#F5B84C]"
                    aria-hidden
                  />
                }
                value={metricsModule.rating > 0 ? metricsModule.rating.toFixed(1) : '—'}
              />
            </div>
            {!isSelf && !isLinkedCopy && currentUserId && (
              <div className="flex items-center gap-2">
                <ModuleFavoriteAction moduleId={metricsModule.id} />
                <ModuleRatingAction moduleId={metricsModule.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
