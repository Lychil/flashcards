export interface GapWordResult {
  display: string
  hiddenIndices: number[]
  answer: string
}

function letterIndices(word: string): number[] {
  const indices: number[] = []
  for (let i = 0; i < word.length; i += 1) {
    if (/[a-zA-Zа-яА-ЯёЁ0-9]/.test(word[i])) {
      indices.push(i)
    }
  }
  return indices
}

export function buildGapWord(term: string, hidePercent: number): GapWordResult {
  const indices = letterIndices(term)
  if (indices.length === 0) {
    return { display: term, hiddenIndices: [], answer: term }
  }

  const hideCount = Math.max(1, Math.round((indices.length * hidePercent) / 100))
  const hiddenIndices = [...indices]
    .sort(() => Math.random() - 0.5)
    .slice(0, hideCount)
    .sort((a, b) => a - b)

  const display = term
    .split('')
    .map((char, index) => (hiddenIndices.includes(index) ? '▢' : char))
    .join('')

  return { display, hiddenIndices, answer: term }
}

export function checkGapAnswer(input: string, answer: string): boolean {
  return input.trim().toLowerCase() === answer.trim().toLowerCase()
}
