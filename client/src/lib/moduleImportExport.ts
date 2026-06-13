import type { Flashcard } from '../types/flashcard'

export type ImportMode = 'merge' | 'replace'
export type ExportFormat = 'tab' | 'csv'

export interface ParsedImportCard {
  term: string
  definition: string
}

function unquoteCsvField(value: string): string {
  const trimmed = value.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"')
  }
  return trimmed
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }
    if (char === ',' && !inQuotes) {
      fields.push(unquoteCsvField(current))
      current = ''
      continue
    }
    current += char
  }

  fields.push(unquoteCsvField(current))
  return fields
}

export function parseImportedCards(text: string): ParsedImportCard[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const cards: ParsedImportCard[] = []

  for (const line of lines) {
    let term = ''
    let definition = ''

    if (line.includes('\t')) {
      const tabIndex = line.indexOf('\t')
      term = line.slice(0, tabIndex).trim()
      definition = line.slice(tabIndex + 1).trim()
    } else if (line.includes(';')) {
      const [left, ...rest] = line.split(';')
      term = left.trim()
      definition = rest.join(';').trim()
    } else if (line.includes(',')) {
      const parts = splitCsvLine(line)
      if (parts.length >= 2) {
        term = parts[0]
        definition = parts.slice(1).join(',').trim()
      }
    } else {
      continue
    }

    if (term && definition) {
      cards.push({ term, definition })
    }
  }

  return cards
}

export function exportCards(cards: Flashcard[], format: ExportFormat): string {
  if (format === 'csv') {
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
    return cards.map((card) => `${escape(card.term)},${escape(card.definition)}`).join('\n')
  }

  return cards.map((card) => `${card.term}\t${card.definition}`).join('\n')
}

export function downloadTextFile(content: string, filename: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\s-а-яА-ЯёЁ]/gi, '').trim().replace(/\s+/g, '_') || 'module'
}
