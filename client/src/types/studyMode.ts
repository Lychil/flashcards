import type { LucideIcon } from 'lucide-react'
import {
  Brain,
  Columns2,
  FileQuestion,
  Gamepad2,
  Layers,
  Puzzle,
  Sparkles,
} from 'lucide-react'

export type StudyModeId =
  | 'cards'
  | 'test'
  | 'gaps'
  | 'matching'
  | 'anagram'
  | 'mnemo'
  | 'blocks'

export type StudyModeGroup = 'standard' | 'minigame'

export interface StudyModeOption {
  id: StudyModeId
  title: string
  shortTitle?: string
  description: string
  group: StudyModeGroup
  icon: LucideIcon
  minCards: number
  accent: string
  premium?: boolean
}

export const STUDY_MODE_GROUPS: { id: StudyModeGroup; label: string }[] = [
  { id: 'standard', label: 'Стандартные методы' },
  { id: 'minigame', label: 'Мини-игры' },
]

export const STUDY_MODES: StudyModeOption[] = [
  {
    id: 'test',
    title: 'Тестирование',
    shortTitle: 'Тест',
    description: 'Вопросы с вариантами ответа по карточкам модуля',
    group: 'standard',
    icon: FileQuestion,
    minCards: 2,
    accent: '#6366f1',
  },
  {
    id: 'cards',
    title: 'Карточки',
    description: 'Переворачивайте и отмечайте: знаю, повторить или не знаю',
    group: 'standard',
    icon: Layers,
    minCards: 1,
    accent: '#5B9FD4',
  },
  {
    id: 'matching',
    title: 'Сопоставление',
    shortTitle: 'Пары',
    description: 'Соедините термины с определениями в двух колонках',
    group: 'standard',
    icon: Columns2,
    minCards: 3,
    accent: '#6BC9A7',
  },
  {
    id: 'gaps',
    title: 'Пропуски',
    description: 'Восстановите термин по определению — настройте сложность',
    group: 'standard',
    icon: Puzzle,
    minCards: 1,
    accent: '#9B8AFB',
  },
  {
    id: 'anagram',
    title: 'Анаграмма',
    description: 'Составьте термин из перемешанных букв',
    group: 'minigame',
    icon: Sparkles,
    minCards: 1,
    accent: '#F5B84C',
    premium: true,
  },
  {
    id: 'mnemo',
    title: 'Мнемо',
    description: 'Запомните последовательность, пройдите отвлечение и воспроизведите',
    group: 'minigame',
    icon: Brain,
    minCards: 2,
    accent: '#E879A9',
    premium: true,
  },
  {
    id: 'blocks',
    title: 'Падающие блоки',
    shortTitle: 'Блоки',
    description: 'Складывайте фигуры в линии. Каждая третья — вопрос по модулю',
    group: 'minigame',
    icon: Gamepad2,
    minCards: 3,
    accent: '#E0956B',
    premium: true,
  },
]

export function getStudyModeById(id: string | null | undefined): StudyModeOption | undefined {
  if (!id) return undefined
  return STUDY_MODES.find((mode) => mode.id === id)
}

export function isStudyModeId(id: string | null | undefined): id is StudyModeId {
  return STUDY_MODES.some((mode) => mode.id === id)
}
