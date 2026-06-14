import { shuffle } from './shuffle'

export const TEST_SESSION_SIZE = 10

export function pickSessionCards<T>(cards: T[], size = TEST_SESSION_SIZE): T[] {
  return shuffle(cards).slice(0, Math.min(size, cards.length))
}
