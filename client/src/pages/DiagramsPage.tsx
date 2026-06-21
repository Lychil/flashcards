import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DiagramCard, DiagramImagePreview } from '../components/diagram/DiagramCard'
import { DiagramFavoriteAction } from '../components/diagram/DiagramFavoriteAction'
import { DiagramLibraryAction } from '../components/diagram/DiagramLibraryAction'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'
import { mockDiagrams } from '../lib/mockDiagrams'
import { diagramRepository } from '../services/diagramRepository'

export function DiagramsPage() {
  const markerCount = mockDiagrams.reduce((sum, diagram) => sum + diagram.markers.length, 0)
  const [libraryDiagrams, setLibraryDiagrams] = useState(() => diagramRepository.loadLibrary())
  const refreshLibraryDiagrams = () => setLibraryDiagrams(diagramRepository.loadLibrary())

  return (
    <PageLayout size="wide">
      <PageBreadcrumbs
        items={[{ label: 'Главная', to: '/' }, { label: 'Интерактивные диаграммы' }]}
        className="mb-5"
      />

      <header className="mb-8 rounded-[30px] bg-surface-subtle px-5 py-6 sm:px-7 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-center">
          <div className="min-w-0">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
              Изображение + разметка
            </p>
            <h1 className="max-w-3xl text-[30px] font-bold leading-[1.08] tracking-[-0.04em] text-text-primary sm:text-[38px]">
              Интерактивные диаграммы
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
              Загружайте изображение, отмечайте точки и зоны, а затем повторяйте их как визуальные карточки.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/create/diagram"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Plus size={16} strokeWidth={2.2} />
                Создать диаграмму
              </Link>
              <span className="text-[13px] text-text-tertiary">
                {mockDiagrams.length} диаграммы · {markerCount} меток
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {mockDiagrams.map((diagram) => (
              <DiagramImagePreview key={diagram.id} diagram={diagram} compact />
            ))}
          </div>
        </div>
      </header>

      {libraryDiagrams.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-text-primary">
              Мои диаграммы
            </h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              Добавленные и созданные схемы, доступные для редактирования.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {libraryDiagrams.map((diagram) => (
              <DiagramCard key={diagram.id} diagram={diagram} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-text-primary">
            Каталог диаграмм
          </h2>
          <p className="mt-1 text-[14px] text-text-secondary">
            Публичные схемы можно повторять сразу или добавить в свою библиотеку.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mockDiagrams.map((diagram) => (
            <div key={diagram.id} className="relative min-w-0">
              <DiagramCard diagram={diagram} />
              <div className="absolute left-5 top-5 z-20 flex gap-2">
                <DiagramLibraryAction
                  diagramId={diagram.id}
                  display="icon"
                  onChange={refreshLibraryDiagrams}
                />
                <DiagramFavoriteAction diagramId={diagram.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
