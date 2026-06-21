import { Map } from 'lucide-react'
import { Link } from 'react-router-dom'
import { mockDiagrams } from '../../lib/mockDiagrams'
import { homeCardClass, moduleInteractiveClass } from './homeStyles'

export function DiagramsPreview() {
  const previewDiagrams = mockDiagrams.slice(0, 2)

  return (
    <div className={`p-4 ${homeCardClass}`}>
      <ul className="flex flex-col gap-1.5">
        {previewDiagrams.map((diagram) => (
          <li key={diagram.id}>
            <Link
              to="/diagrams"
              className={[
                'flex cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-surface-subtle/50 px-3 py-3',
                moduleInteractiveClass,
                'hover:border-border hover:bg-white',
              ].join(' ')}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: diagram.accentSoft, color: diagram.accent }}
              >
                <Map size={16} strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-text-primary">
                  {diagram.title}
                </p>
                <p className="text-[11px] text-text-tertiary">{diagram.markers.length} меток</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
