export type LetterStatus = 'correct' | 'wrong'

export interface LetterDiffItem {
  char: string
  status: LetterStatus
}

export function normalizeSpelling(value: string): string {
  return value.replace(/\s/g, '').toLowerCase()
}

export function isSpellingMatch(userAnswer: string, correctAnswer: string): boolean {
  return normalizeSpelling(userAnswer) === normalizeSpelling(correctAnswer)
}

export function compareSpelling(userAnswer: string, correctAnswer: string): LetterDiffItem[] {
  const user = userAnswer.replace(/\s/g, '')

  return user.split('').map((char, index) => {
    const expected = correctAnswer.replace(/\s/g, '')[index] ?? ''
    return {
      char,
      status: char.toLowerCase() === expected.toLowerCase() ? 'correct' : 'wrong',
    }
  })
}
