import { Link, useNavigate } from 'react-router-dom'

interface AuthPageProps {
  mode: 'login' | 'register'
}

function YandexIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M13.6 13.4h-2.1L7.8 22H4.9l4.1-9.2c-2.1-1-3.2-2.9-3.2-5.4C5.8 4 8.1 2 12 2h4.2v20h-2.6v-8.6Zm0-9.1H12c-2.3 0-3.5 1.1-3.5 3.2s1.2 3.5 3.4 3.5h1.7V4.3Z"
      />
    </svg>
  )
}

function VkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M3.4 7.2c.1 5.2 2.7 8.3 7.2 8.3h.3v-3c1.6.2 2.8 1.4 3.3 3h2.9c-.6-2.3-2.3-3.6-3.4-4.1 1.1-.6 2.6-2.1 2.9-4.2h-2.6c-.5 1.7-1.8 3.2-3 3.4V7.2H8.4v6.4c-1.3-.3-3-2-3.1-6.4H3.4Z"
      />
    </svg>
  )
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()
  const isLogin = mode === 'login'
  const title = isLogin ? 'Вход' : 'Регистрация'
  const handleMockAuth = () => navigate('/')

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-white px-5 py-8">
      <Link
        to="/"
        className="absolute left-5 top-5 inline-flex items-center gap-2 text-[15px] font-semibold text-text-primary sm:left-8 sm:top-8"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-[13px] font-semibold text-accent">
          M
        </span>
        <span>
          Mnemo
        </span>
      </Link>

      <div className="w-full max-w-[420px] text-center">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
          Карточки, схемы, повторение
        </p>
        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-text-primary">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-[360px] text-[13px] leading-relaxed text-text-tertiary">
          Залетайте в Mnemo: всё нужное для подготовки уже собрано в одном рабочем пространстве.
        </p>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={handleMockAuth}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#FC3F1D] px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <YandexIcon />
            {isLogin ? 'Войти через Яндекс ID' : 'Зарегистрироваться через Яндекс ID'}
          </button>
          <button
            type="button"
            onClick={handleMockAuth}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#0077FF] px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <VkIcon />
            {isLogin ? 'Войти через VK ID' : 'Зарегистрироваться через VK ID'}
          </button>
        </div>
      </div>
    </main>
  )
}
