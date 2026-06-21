import { CheckCheck } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  body: string
  time: string
  unread?: boolean
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Повторение на сегодня',
    body: '13 карточек созрели к повторению — самое время пройти сессию.',
    time: '5 мин назад',
    unread: true,
  },
  {
    id: '2',
    title: 'Новый модуль в подборке',
    body: 'В «Популярное» добавлен набор «Латинские термины для медиков».',
    time: '2 ч назад',
    unread: true,
  },
  {
    id: '3',
    title: 'План подготовки',
    body: 'Вы на 68% готовности — сегодня запланировано 24 карточки.',
    time: 'Вчера',
  },
]

interface AppNotificationsPopupProps {
  open: boolean
}

export function AppNotificationsPopup({ open }: AppNotificationsPopupProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-label="Уведомления"
      className={[
        'absolute right-0 top-full z-30 mt-2 w-[min(360px,calc(100vw-2rem))]',
        'overflow-hidden rounded-2xl border border-border bg-white shadow-lg',
      ].join(' ')}
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <p className="text-[14px] font-semibold text-text-primary">Уведомления</p>
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
        >
          <CheckCheck size={14} strokeWidth={1.75} />
          Прочитать все
        </button>
      </div>

      <ul className="max-h-[min(420px,70dvh)] overflow-y-auto py-1">
        {MOCK_NOTIFICATIONS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={[
                'flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted',
                item.unread ? 'bg-accent-muted/30' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  item.unread ? 'bg-accent' : 'bg-transparent',
                ].join(' ')}
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="mb-0.5 block text-[13px] font-medium text-text-primary">
                  {item.title}
                </span>
                <span className="block text-[12px] leading-relaxed text-text-secondary">
                  {item.body}
                </span>
                <span className="mt-1 block text-[11px] text-text-tertiary">{item.time}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function hasUnreadNotifications(): boolean {
  return MOCK_NOTIFICATIONS.some((item) => item.unread)
}
