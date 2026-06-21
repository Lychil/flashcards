import { Link } from 'react-router-dom'

export function LogoutPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white px-5 py-8">
      <div className="w-full max-w-[440px] rounded-[32px] bg-surface-subtle p-6 text-center sm:p-8">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
          Сессия
        </p>
        <h1 className="text-[30px] font-bold leading-tight tracking-[-0.04em] text-text-primary">
          Вы вышли из аккаунта
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Это отдельный экран выхода без общей навигации приложения.
        </p>
        <div className="mt-8 grid gap-3">
          <Link
            to="/login"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Войти снова
          </Link>
          <Link
            to="/"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-white px-4 text-[14px] font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
          >
            На главную
          </Link>
        </div>
      </div>
    </main>
  )
}
