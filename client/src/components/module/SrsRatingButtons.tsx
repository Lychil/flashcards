import type { SrsRating } from '../../types/srs'

const BUTTONS: {
  id: SrsRating
  label: string
  hint: string
  className: string
}[] = [
  {
    id: 'again',
    label: 'Повторить',
    hint: '1 мин',
    className: 'bg-[#E879A9]/15 text-[#b04472] hover:bg-[#E879A9]/25',
  },
  {
    id: 'hard',
    label: 'Трудно',
    hint: '12 ч',
    className: 'bg-[#F5B84C]/15 text-[#9a6b12] hover:bg-[#F5B84C]/25',
  },
  {
    id: 'good',
    label: 'Хорошо',
    hint: '2 дн',
    className: 'bg-[#6BC9A7]/15 text-[#2d8a66] hover:bg-[#6BC9A7]/25',
  },
  {
    id: 'easy',
    label: 'Легко',
    hint: '4–5 дн',
    className: 'bg-[#5B9FD4]/15 text-[#2d6a9f] hover:bg-[#5B9FD4]/25',
  },
]

interface SrsRatingButtonsProps {
  onRate: (rating: SrsRating) => void
  disabled?: boolean
  className?: string
}

export function SrsRatingButtons({ onRate, disabled, className = '' }: SrsRatingButtonsProps) {
  return (
    <div
      className={[
        'grid w-full max-w-[640px] grid-cols-2 gap-2 sm:grid-cols-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {BUTTONS.map((btn) => (
        <button
          key={btn.id}
          type="button"
          disabled={disabled}
          onClick={() => onRate(btn.id)}
          className={[
            'cursor-pointer rounded-xl px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40',
            btn.className,
          ].join(' ')}
        >
          <span className="block text-[13px] font-semibold">{btn.label}</span>
          <span className="mt-0.5 block text-[11px] font-medium opacity-75">{btn.hint}</span>
        </button>
      ))}
    </div>
  )
}
