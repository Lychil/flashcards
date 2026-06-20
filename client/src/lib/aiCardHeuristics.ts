/** Heuristics for marking trivial AI-generated cards before save */
export function isTrivialGeneratedCard(term: string, definition: string): boolean {
  const t = term.trim()
  const d = definition.trim()
  if (t.length <= 2) return true
  if (d.length <= 6) return true
  if (t.toLowerCase() === d.toLowerCase()) return true
  if (d.length <= t.length + 4) return true
  const words = d.split(/\s+/)
  if (words.length <= 2 && t.length > 8) return true
  return false
}
