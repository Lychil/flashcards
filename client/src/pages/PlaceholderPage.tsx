interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="w-full max-w-[1080px] py-8 lg:py-12">
      <h1 className="text-2xl font-semibold text-text-primary mb-2">{title}</h1>
      <p className="text-text-secondary text-sm">Раздел в разработке</p>
    </div>
  )
}
