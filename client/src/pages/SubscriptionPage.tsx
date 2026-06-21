import { Check } from 'lucide-react'
import { PageBreadcrumbs } from '../components/layout/PageBreadcrumbs'
import { PageLayout } from '../components/layout/PageLayout'

const plans = [
  {
    name: 'Free',
    price: '0 ₽',
    description: 'Базовый режим для личного обучения и первых наборов.',
    features: ['Модули и папки', 'Интерактивные диаграммы', 'Повторение по расписанию'],
    action: 'Текущий план',
    accent: '#0A1225',
  },
  {
    name: 'Premium',
    price: '399 ₽/мес',
    description: 'Расширенные возможности для активной подготовки.',
    features: ['Больше генераций с ИИ', 'Расширенная аналитика', 'Приоритетные функции диаграмм'],
    action: 'Перейти на Premium',
    accent: '#6366F1',
  },
]

export function SubscriptionPage() {
  return (
    <PageLayout>
      <PageBreadcrumbs
        items={[{ label: 'Главная', to: '/' }, { label: 'Подписка' }]}
        className="mb-8"
      />

      <header className="mx-auto mb-8 max-w-3xl text-center">
        <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-text-tertiary">
          Подписка
        </p>
        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.04em] text-text-primary sm:text-[42px]">
          Выберите план обучения
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Начните бесплатно и подключите Premium, когда понадобится больше возможностей.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2">
        {plans.map((plan) => (
          <article key={plan.name} className="flex min-h-[360px] flex-col rounded-[30px] bg-surface-subtle p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-bold tracking-[-0.04em] text-text-primary">{plan.name}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{plan.description}</p>
              </div>
              <p className="shrink-0 text-[20px] font-bold tracking-[-0.03em] text-text-primary">{plan.price}</p>
            </div>

            <ul className="mt-8 grid gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-[14px] text-text-secondary">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-text-primary">
                    <Check size={15} strokeWidth={2.4} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-auto inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: plan.accent }}
            >
              {plan.action}
            </button>
          </article>
        ))}
      </div>
    </PageLayout>
  )
}
