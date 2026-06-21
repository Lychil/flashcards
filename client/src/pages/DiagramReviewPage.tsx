import { ArrowLeft, CheckCircle2, LocateFixed, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DiagramFavoriteAction } from '../components/diagram/DiagramFavoriteAction'
import { DiagramLibraryAction } from '../components/diagram/DiagramLibraryAction'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { EmptyPlaceholder } from '../components/ui/ContentPlaceholder'
import type { Diagram } from '../types/diagram'
import { diagramRepository } from '../services/diagramRepository'
import type { DiagramMarker } from '../types/diagram'

type AnswerStatus = 'idle' | 'correct' | 'wrong'

const modeTitle: Record<Diagram['reviewMode'], string> = {
  'label-recall': 'Найти метку',
  'zone-pick': 'Выбрать зону',
}

function pointsToSvg(points: DiagramMarker['points']): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

function DiagramReviewCanvas({
  diagram,
  activeMarker,
  answeredIds,
  selectedMarkerId,
  status,
  onPick,
}: {
  diagram: Diagram
  activeMarker: DiagramMarker
  answeredIds: Set<string>
  selectedMarkerId: string | null
  status: AnswerStatus
  onPick: (markerId: string) => void
}) {
  const zones = diagram.markers.filter((marker) => marker.type === 'zone' && marker.points.length >= 3)

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-surface-subtle">
      <img
        src={diagram.imageDataUrl}
        alt={diagram.title}
        className="mx-auto max-h-[68dvh] min-h-[320px] w-full object-contain"
      />

      {zones.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
          {zones.map((zone) => {
            const isActive = zone.id === activeMarker.id
            const isAnswered = answeredIds.has(zone.id)
            return (
              <polygon
                key={zone.id}
                points={pointsToSvg(zone.points)}
                fill={zone.color ?? diagram.accent}
                opacity={isActive ? 0.2 : isAnswered ? 0.14 : 0.08}
              />
            )
          })}
        </svg>
      )}

      {diagram.markers.map((marker, index) => {
        const isActive = marker.id === activeMarker.id
        const isAnswered = answeredIds.has(marker.id)
        const isSelected = selectedMarkerId === marker.id
        const isCorrect = isAnswered || (isSelected && status === 'correct')
        const isWrong = isSelected && status === 'wrong'

        return (
          <button
            key={marker.id}
            type="button"
            onClick={() => onPick(marker.id)}
            className={[
              'absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full',
              'text-[11px] font-bold transition-all duration-200',
              'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
              isActive ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-8 w-8 sm:h-9 sm:w-9',
              isCorrect
                ? 'bg-[#35A978] text-white'
                : isWrong
                  ? 'bg-[#E85D75] text-white'
                  : 'bg-white/95 text-text-primary hover:scale-105',
            ].join(' ')}
            style={{
              left: `${marker.x * 100}%`,
              top: `${marker.y * 100}%`,
              color: !isCorrect && !isWrong ? diagram.accent : undefined,
            }}
            aria-label={marker.label}
          >
            {isCorrect ? (
              <CheckCircle2 size={16} strokeWidth={2.3} />
            ) : isWrong ? (
              <XCircle size={16} strokeWidth={2.3} />
            ) : marker.type === 'zone' ? (
              index + 1
            ) : (
              <LocateFixed size={15} strokeWidth={2.2} />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function DiagramReviewPage() {
  const { diagramId = '' } = useParams()
  const diagram = diagramRepository.findAny(diagramId)
  const [activeIndex, setActiveIndex] = useState(0)
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(new Set())
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [status, setStatus] = useState<AnswerStatus>('idle')
  const [mistakes, setMistakes] = useState(0)

  const markers = diagram?.markers ?? []
  const activeMarker = markers[activeIndex]
  const finished = markers.length > 0 && answeredIds.size >= markers.length
  const progress = markers.length ? Math.round((answeredIds.size / markers.length) * 100) : 0
  const currentModeTitle = diagram ? modeTitle[diagram.reviewMode] : 'Повторение'

  if (!diagram || !activeMarker) {
    return (
      <PageLayout>
        <PageBreadcrumbs
          items={[
            { label: 'Главная', to: '/' },
            { label: 'Интерактивные диаграммы', to: '/diagrams' },
            { label: 'Повторение' },
          ]}
          className="mb-5"
        />
        <EmptyPlaceholder
          title="Диаграмма не найдена"
          description="Возможно, моковые данные были изменены или ссылка устарела."
          action={
            <Link to="/diagrams" className="font-semibold text-accent hover:underline">
              Вернуться к диаграммам
            </Link>
          }
        />
      </PageLayout>
    )
  }

  const resetFeedback = () => {
    setSelectedMarkerId(null)
    setStatus('idle')
  }

  const goNext = () => {
    const nextIndex = markers.findIndex((marker, index) => index > activeIndex && !answeredIds.has(marker.id))
    setActiveIndex(nextIndex >= 0 ? nextIndex : Math.min(activeIndex + 1, markers.length - 1))
    resetFeedback()
  }

  const handlePick = (markerId: string) => {
    if (finished || answeredIds.has(markerId)) return

    setSelectedMarkerId(markerId)

    if (markerId !== activeMarker.id) {
      setStatus('wrong')
      setMistakes((count) => count + 1)
      return
    }

    setStatus('correct')
    setAnsweredIds((prev) => new Set([...prev, markerId]))
  }

  const restart = () => {
    setActiveIndex(0)
    setAnsweredIds(new Set())
    resetFeedback()
    setMistakes(0)
  }

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[
          { label: 'Главная', to: '/' },
          { label: 'Интерактивные диаграммы', to: '/diagrams' },
          { label: diagram.title, to: `/diagrams/${diagram.id}` },
          { label: currentModeTitle },
        ]}
        className="mb-5"
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link
            to={`/diagrams/${diagram.id}`}
            className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            К диаграмме
          </Link>
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
            {currentModeTitle}
          </p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.04em] text-text-primary sm:text-[36px]">
            {diagram.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={restart}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-surface-subtle px-4 py-2.5 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            <RotateCcw size={15} strokeWidth={2} />
            Заново
          </button>
          <DiagramFavoriteAction diagramId={diagram.id} display="button" />
          <DiagramLibraryAction diagramId={diagram.id} variant={diagram.ownerId ? 'edit' : 'copy'} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
        <div className="min-w-0">
          <DiagramReviewCanvas
            diagram={diagram}
            activeMarker={activeMarker}
            answeredIds={answeredIds}
            selectedMarkerId={selectedMarkerId}
            status={status}
            onPick={handlePick}
          />
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[24px] bg-white p-4 sm:p-5">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-[12px] font-semibold text-text-tertiary">
                <span>{answeredIds.size}/{markers.length}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, backgroundColor: diagram.accent }}
                />
              </div>
            </div>

            {finished ? (
              <div className="rounded-[20px] bg-surface-subtle p-4 text-center">
                <CheckCircle2 size={28} strokeWidth={2.2} className="mx-auto mb-2 text-[#35A978]" />
                <p className="text-[16px] font-semibold text-text-primary">Повторение завершено</p>
                <p className="mt-1 text-[13px] text-text-secondary">Ошибок: {mistakes}</p>
              </div>
            ) : (
              <>
                <div className="rounded-[20px] bg-surface-subtle p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
                    Найдите
                  </p>
                  <p className="mt-2 text-[21px] font-semibold leading-tight tracking-[-0.03em] text-text-primary">
                    {activeMarker.label}
                  </p>
                </div>

                <div className="mt-3 flex gap-2">
                  {status === 'wrong' && (
                    <button
                      type="button"
                      onClick={resetFeedback}
                      className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-surface-subtle px-3 py-2.5 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                    >
                      Попробовать снова
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={status !== 'correct'}
                    onClick={goNext}
                    className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-45"
                    style={{ backgroundColor: diagram.accent }}
                  >
                    Дальше
                  </button>
                </div>
              </>
            )}

            {status === 'correct' && (
              <div className="mt-4 rounded-[18px] bg-[#35A978]/10 p-3">
                <p className="text-[12px] font-semibold text-[#247D5A]">Верно</p>
              </div>
            )}

            {status === 'wrong' && (
              <div className="mt-4 rounded-[18px] bg-[#E85D75]/10 p-3">
                <p className="text-[12px] font-semibold text-[#B64258]">Не эта метка</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </PageLayout>
  )
}
