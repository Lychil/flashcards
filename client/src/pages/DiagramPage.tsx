import { ArrowLeft, Heart, Play, Star } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DiagramFavoriteAction } from '../components/diagram/DiagramFavoriteAction'
import { DiagramImagePreview } from '../components/diagram/DiagramCard'
import { DiagramLibraryAction } from '../components/diagram/DiagramLibraryAction'
import { DiagramRatingAction } from '../components/diagram/DiagramRatingAction'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { diagramFavoritesRepository } from '../services/diagramFavoritesRepository'
import { diagramRatingsRepository } from '../services/diagramRatingsRepository'
import { diagramRepository } from '../services/diagramRepository'

export function DiagramPage() {
  const { diagramId = '' } = useParams()
  const diagram = diagramRepository.findAny(diagramId)

  if (!diagram) {
    return <Navigate to="/diagrams" replace />
  }

  const isOwn = Boolean(diagram.ownerId)
  const sourceDiagram = diagram.sourceDiagramId ? diagramRepository.findAny(diagram.sourceDiagramId) : null
  const displayAuthor = sourceDiagram?.author ?? diagram.author
  const favoriteCount = (diagramFavoritesRepository.isFavorited(diagram.id) ? 1 : 0) +
    (diagram.sourceDiagramId && diagramFavoritesRepository.isFavorited(diagram.sourceDiagramId) ? 1 : 0)
  const rating = diagramRatingsRepository.getAverageRating(diagram.sourceDiagramId ?? diagram.id)

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: isOwn ? 'Библиотека' : 'Интерактивные диаграммы', to: isOwn ? '/library' : '/diagrams' },
          { label: diagram.title },
        ]}
        className="mb-5"
      />

      <Link
        to={isOwn ? '/library' : '/diagrams'}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
      >
        <ArrowLeft size={16} strokeWidth={2} />
        {isOwn ? 'В библиотеку' : 'Все диаграммы'}
      </Link>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="min-w-0">
          <header className="mb-6">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-[12px]"
                style={{ color: diagram.accent, backgroundColor: diagram.accentSoft }}
              >
                {diagram.subject}
              </span>
              <span className="text-[11px] font-medium text-text-tertiary sm:text-[12px]">
                {isOwn ? 'В вашей библиотеке' : 'Публичная диаграмма'}
              </span>
              {sourceDiagram && (
                <Link
                  to={`/diagrams/${sourceDiagram.id}`}
                  className="rounded-full bg-surface-subtle px-2.5 py-0.5 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary sm:text-[12px]"
                >
                  Копия · оригинал
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <h1 className="min-w-0 flex-1 text-[28px] font-bold leading-tight tracking-[-0.04em] text-text-primary sm:text-[36px]">
                {diagram.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <DiagramFavoriteAction diagramId={diagram.id} display="button" />
                <DiagramRatingAction diagramId={diagram.sourceDiagramId ?? diagram.id} />
                <DiagramLibraryAction diagramId={diagram.id} variant={isOwn ? 'edit' : 'copy'} />
              </div>
            </div>

            {diagram.description && (
              <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-text-secondary">
                {diagram.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ backgroundColor: diagram.accent }}
                title={isOwn ? 'Вы' : displayAuthor.name}
              >
                {isOwn ? 'Вы' : displayAuthor.name.charAt(0)}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-text-primary">
                  {isOwn ? 'Вашa диаграмма' : displayAuthor.name}
                </p>
                <p className="text-[12px] text-text-tertiary">
                  {sourceDiagram ? 'Автор оригинала' : 'Автор'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-text-secondary">
              <span>{diagram.markers.length} меток</span>
              <span className="inline-flex items-center gap-1">
                <Heart size={13} strokeWidth={2} className="fill-red-400 text-red-400" />
                {favoriteCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star size={13} strokeWidth={2} className="fill-[#F5B84C] text-[#F5B84C]" />
                {rating > 0 ? rating.toFixed(1) : '—'}
              </span>
              <span>обновлено: {diagram.updatedAt}</span>
            </div>
          </header>

          <DiagramImagePreview diagram={diagram} />
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[24px] bg-white p-5">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
              Повторение
            </p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-text-primary">
              Закрепить разметку
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
              Найдите отмеченные точки и зоны на изображении без подсказок.
            </p>
            <Link
              to={`/diagrams/${diagram.id}/review`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: diagram.accent }}
            >
              <Play size={16} strokeWidth={2.3} />
              Повторить
            </Link>
          </div>
        </aside>
      </div>
    </PageLayout>
  )
}
