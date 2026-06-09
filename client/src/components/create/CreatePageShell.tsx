import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface CreatePageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function CreatePageShell({
  eyebrow,
  title,
  description,
  children,
}: CreatePageShellProps) {
  return (
    <div className="w-full max-w-[640px] py-10 lg:py-14">
      <Link
        to="/"
        className={[
          'inline-flex items-center gap-1.5 mb-8',
          'text-[13px] font-medium text-text-secondary',
          'hover:text-text-primary transition-colors duration-200',
        ].join(' ')}
      >
        <ArrowLeft size={15} strokeWidth={1.5} />
        На главную
      </Link>

      <header className="mb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-tertiary mb-3">
          {eyebrow}
        </p>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.03em] leading-[1.12] mb-2">
          {title}
        </h1>
        <p className="text-[14px] text-text-secondary leading-relaxed">{description}</p>
      </header>

      {children}
    </div>
  )
}
