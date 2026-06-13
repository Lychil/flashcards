import { FileText, Folder, Map } from 'lucide-react'
import { Link } from 'react-router-dom'
import { homeCardClass, moduleInteractiveClass } from './homeStyles'

const items = [
  {
    to: '/create/folder',
    title: 'Папка',
    description: 'Сгруппировать модули',
    icon: Folder,
    tint: '#9B8AFB',
  },
  {
    to: '/create/module',
    title: 'Модуль',
    description: 'Текстовые карточки',
    icon: FileText,
    tint: '#6366f1',
  },
  {
    to: '/create/diagram',
    title: 'Диаграмма',
    description: 'Схема с зонами',
    icon: Map,
    tint: '#5B9FD4',
  },
]

export function QuickCreateSection() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.to}
            to={item.to}
            className={[
              `flex cursor-pointer flex-col gap-3 px-4 py-4 ${homeCardClass}`,
              moduleInteractiveClass,
              'hover:bg-surface-subtle/40',
            ].join(' ')}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${item.tint}18`, color: item.tint }}
            >
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-text-primary">{item.title}</p>
              <p className="mt-0.5 text-[12px] text-text-secondary">{item.description}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
