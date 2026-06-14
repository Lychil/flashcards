import type { Flashcard } from '../types/flashcard'

export const mockFlashcardsByModule: Record<string, Flashcard[]> = {
  '1': [
    { id: '1-1', term: 'Плечевая кость', definition: 'Humerus — соединяет лопатку с предплечьем' },
    { id: '1-2', term: 'Локтевая кость', definition: 'Ulna — медиальная кость предплечья' },
    { id: '1-3', term: 'Лучевая кость', definition: 'Radius — латеральная кость предплечья' },
    { id: '1-4', term: 'Ключица', definition: 'Clavicula — соединяет верхнюю конечность с туловищем' },
    { id: '1-5', term: 'Лопатка', definition: 'Scapula — плоская кость задней стенки плеча' },
    { id: '1-6', term: 'Пястные кости', definition: 'Ossa metacarpi — пять коротких костей кисти' },
    { id: '1-7', term: 'Фаланги', definition: 'Phalanx — кости пальцев кисти' },
    { id: '1-8', term: 'Акромион', definition: 'Выступ лопатки, место прикрепления ключицы' },
  ],
  '2': [
    { id: '2-1', term: 'bring', definition: 'brought — приносить' },
    { id: '2-2', term: 'catch', definition: 'caught — ловить' },
    { id: '2-3', term: 'think', definition: 'thought — думать' },
    { id: '2-4', term: 'buy', definition: 'bought — покупать' },
    { id: '2-5', term: 'teach', definition: 'taught — учить, преподавать' },
    { id: '2-6', term: 'find', definition: 'found — находить' },
  ],
  '3': [
    { id: '3-1', term: 'Предсердие', definition: 'Atrium — камера, принимающая кровь' },
    { id: '3-2', term: 'Желудочек', definition: 'Ventriculus — камера, выбрасывающая кровь' },
    { id: '3-3', term: 'Аорта', definition: 'Самый крупный артериальный сосуд тела' },
    { id: '3-4', term: 'Митральный клапан', definition: 'Клапан между левым предсердием и желудочком' },
    { id: '3-5', term: 'Перикард', definition: 'Серозная оболочка сердца' },
  ],
  '4': [
    { id: '4-1', term: 'Метан', definition: 'CH₄ — простейший алкан' },
    { id: '4-2', term: 'Этанол', definition: 'C₂H₅OH — одноатомный спирт' },
    { id: '4-3', term: 'Бензол', definition: 'C₆H₆ — ароматический углеводород' },
    { id: '4-4', term: 'Уксусная кислота', definition: 'CH₃COOH — карбоновая кислота' },
    { id: '4-5', term: 'Этилен', definition: 'C₂H₄ — алкен с одной двойной связью' },
  ],
}

export function getFlashcardsForModule(moduleId: string, previewWords: string[]): Flashcard[] {
  if (mockFlashcardsByModule[moduleId]) {
    return mockFlashcardsByModule[moduleId]
  }

  return previewWords.map((word, index) => ({
    id: `${moduleId}-${index}`,
    term: word,
    definition: `Обратная сторона: «${word}»`,
  }))
}
