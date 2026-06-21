import type {
  AiGenerationInput,
  GeneratedCard,
  SourceReference,
  SourceType,
} from '../types/aiGeneration'

export interface AiGenerationCallbacks {
  onCard: (card: GeneratedCard) => void
  onComplete: (cards: GeneratedCard[]) => void
  onError: (message: string) => void
}

export interface AiGenerationHandle {
  cancel: () => void
}

const FALLBACK_CARDS: Omit<GeneratedCard, 'id' | 'sourceRef' | 'status'>[] = [
  { term: 'Митохондрия', definition: 'Органелла клетки, «энергетическая станция»' },
  { term: 'Фотосинтез', definition: 'Процесс образования органики из CO₂ и воды на свету' },
  { term: 'ДНК', definition: 'Молекула, хранящая генетическую информацию' },
  { term: 'Рибosome', definition: 'Субклеточная структура синтеза белка' },
  { term: 'Клеточная мембрана', definition: 'Полупроницаемая оболочка, отделяющая клетку от среды' },
]

function resolveSource(input: AiGenerationInput): {
  text: string
  sourceType: SourceType
  sourceLabel: string
} {
  if (input.text?.trim()) {
    return { text: input.text.trim(), sourceType: 'text', sourceLabel: 'Введённый текст' }
  }
  if (input.fileContent?.trim()) {
    return {
      text: input.fileContent.trim(),
      sourceType: 'file',
      sourceLabel: input.fileName ?? 'Загруженный файл',
    }
  }
  if (input.url?.trim()) {
    return {
      text: '',
      sourceType: 'url',
      sourceLabel: input.url.trim(),
    }
  }
  return { text: '', sourceType: 'text', sourceLabel: 'Материал' }
}

function extractPairs(text: string): { term: string; definition: string; excerpt: string; start: number; end: number }[] {
  const pairs: { term: string; definition: string; excerpt: string; start: number; end: number }[] = []
  const lines = text.split(/\r?\n/)

  let offset = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      offset += line.length + 1
      continue
    }

    const patterns = [
      /^[-•*]\s*(.+?)\s*[—–-]\s*(.+)$/,
      /^[-•*]\s*(.+?)\s*:\s*(.+)$/,
      /^(.+?)\s*[—–-]\s*(.+)$/,
      /^(.+?)\s*:\s*(.+)$/,
    ]

    for (const pattern of patterns) {
      const match = trimmed.match(pattern)
      if (match) {
        const term = match[1].trim()
        const definition = match[2].trim()
        if (term.length >= 2 && definition.length >= 3 && term.length < 80) {
          const start = offset + line.indexOf(trimmed)
          pairs.push({
            term,
            definition,
            excerpt: trimmed,
            start,
            end: start + trimmed.length,
          })
          break
        }
      }
    }

    offset += line.length + 1
  }

  return pairs
}

function buildSourceRef(
  excerpt: string,
  sourceType: SourceType,
  sourceLabel: string,
  start?: number,
  end?: number,
): SourceReference {
  return {
    excerpt: excerpt.slice(0, 200),
    startOffset: start,
    endOffset: end,
    sourceType,
    sourceLabel,
  }
}

function makeGeneratedCard(
  term: string,
  definition: string,
  sourceRef: SourceReference,
  index: number,
): GeneratedCard {
  return {
    id: `gen-${Date.now()}-${index}`,
    term,
    definition,
    sourceRef,
    status: 'pending',
  }
}

export function startAiGeneration(
  input: AiGenerationInput,
  callbacks: AiGenerationCallbacks,
): AiGenerationHandle {
  let cancelled = false
  const timers: ReturnType<typeof setTimeout>[] = []

  const schedule = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timers.push(id)
  }

  schedule(async () => {
    if (cancelled) return

    try {
      const { text, sourceType, sourceLabel } = resolveSource(input)

      if (sourceType === 'url' && !text) {
        schedule(() => {
          if (cancelled) return
          const cards = FALLBACK_CARDS.map((c, i) =>
            makeGeneratedCard(
              c.term,
              c.definition,
              buildSourceRef(
                `Материал по ссылке ${sourceLabel}`,
                sourceType,
                sourceLabel,
              ),
              i,
            ),
          )
          cards.forEach((card, i) => {
            schedule(() => {
              if (!cancelled) callbacks.onCard(card)
            }, i * 400)
          })
          schedule(() => {
            if (!cancelled) callbacks.onComplete(cards)
          }, cards.length * 400 + 100)
        }, 800)
        return
      }

      if (!text.trim()) {
        callbacks.onError('Не удалось прочитать материал. Попробуйте другой формат.')
        return
      }

      const pairs = extractPairs(text)
      const sourceCards =
        pairs.length > 0
          ? pairs.map((p, i) =>
              makeGeneratedCard(
                p.term,
                p.definition,
                buildSourceRef(p.excerpt, sourceType, sourceLabel, p.start, p.end),
                i,
              ),
            )
          : FALLBACK_CARDS.slice(0, 3).map((c, i) =>
              makeGeneratedCard(
                c.term,
                c.definition,
                buildSourceRef(text.slice(0, 120) + (text.length > 120 ? '…' : ''), sourceType, sourceLabel),
                i,
              ),
            )

      if (sourceCards.length === 0) {
        callbacks.onComplete([])
        return
      }

      sourceCards.forEach((card, i) => {
        schedule(() => {
          if (!cancelled) callbacks.onCard(card)
        }, 600 + i * 450)
      })

      schedule(() => {
        if (!cancelled) callbacks.onComplete(sourceCards)
      }, 600 + sourceCards.length * 450 + 100)
    } catch {
      if (!cancelled) callbacks.onError('Произошла ошибка при генерации. Попробуйте ещё раз.')
    }
  }, 300)

  return {
    cancel() {
      cancelled = true
      timers.forEach(clearTimeout)
    },
  }
}
