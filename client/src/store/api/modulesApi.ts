import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { getFlashcardsForModule } from '../../lib/mockFlashcards'
import { mergeModuleCards } from '../../lib/mergeModuleCards'
import { getLinkedCopyId } from '../../lib/moduleAccess'
import { cardRepository } from '../../services/cardRepository'
import { moduleFavoritesRepository } from '../../services/moduleFavoritesRepository'
import { moduleRatingsRepository } from '../../services/moduleRatingsRepository'
import { userModuleRepository } from '../../services/userModuleRepository'
import type { Flashcard } from '../../types/flashcard'
import type { LibraryFolder } from '../../types/library'
import type { Module, User } from '../../types/module'

export interface ModuleDetail {
  module: Module
  flashcards: Flashcard[]
}

const mockUser: User = {
  id: '1',
  name: 'Александр',
  isPremium: true,
}

const mockAuthors = {
  self: { id: '1', name: 'Александр' },
  maria: { id: '2', name: 'Мария', avatarUrl: 'https://i.pravatar.cc/80?img=5' },
  dmitry: { id: '3', name: 'Дмитрий', avatarUrl: 'https://i.pravatar.cc/80?img=12' },
  elena: { id: '4', name: 'Елена', avatarUrl: 'https://i.pravatar.cc/80?img=32' },
  ivan: { id: '5', name: 'Иван', avatarUrl: 'https://i.pravatar.cc/80?img=68' },
} as const

export const mockModules: Module[] = [
  {
    id: '1',
    title: 'Кости верхней конечности',
    description: 'Кости верхней конечности: плечо, предплечье и кисть для подготовки к практикумам.',
    previewWords: ['Плечевая', 'Локтевая', 'Лучевая', 'Запястные'],
    wordCount: 28,
    category: 'Анатомия',
    progress: 72,
    type: 'interactive',
    color: '#9B8AFB',
    author: mockAuthors.self,
    favoriteCount: 842,
    rating: 4.8,
    folderId: 'f1',
    lastReviewedAt: '2026-06-06T07:30:00Z',
    updatedAt: '2026-06-05T10:00:00Z',
  },
  {
    id: '2',
    title: 'Irregular Verbs — Part 2',
    description: 'Неправильные глаголы для уровня B1–B2',
    previewWords: ['brought', 'caught', 'thought', 'bought'],
    wordCount: 42,
    category: 'Английский',
    track: 'languages',
    progress: 45,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.maria,
    favoriteCount: 1240,
    rating: 4.6,
    folderId: 'f2',
    lastReviewedAt: '2026-06-05T18:00:00Z',
    updatedAt: '2026-06-04T14:30:00Z',
  },
  {
    id: '3',
    title: 'Строение сердца',
    description: 'Камеры, клапаны и сосуды сердечной мышцы',
    previewWords: ['Предсердие', 'Желудочек', 'Аорта', 'Митральный'],
    wordCount: 19,
    category: 'Анатомия',
    track: 'medicine',
    progress: 90,
    type: 'interactive',
    author: mockAuthors.dmitry,
    favoriteCount: 516,
    rating: 4.9,
    folderId: 'f1',
    lastReviewedAt: '2026-06-06T06:00:00Z',
    updatedAt: '2026-06-03T09:15:00Z',
  },
  {
    id: '4',
    title: 'Органические соединения',
    description: 'Основные классы органики: алканы, алкены, спирты',
    previewWords: ['Метан', 'Этанол', 'Бензол', 'Уксусная'],
    wordCount: 35,
    category: 'Химия',
    track: 'ege',
    progress: 28,
    type: 'text',
    author: mockAuthors.maria,
    favoriteCount: 328,
    rating: 4.3,
    folderId: 'f3',
    lastReviewedAt: '2026-06-02T11:20:00Z',
    updatedAt: '2026-06-02T16:45:00Z',
  },
  {
    id: '5',
    title: 'Биохимия — черновик',
    description: 'Модуль создан, карточки ещё не добавлены',
    previewWords: [],
    wordCount: 0,
    category: 'Биология',
    progress: 0,
    type: 'text',
    color: '#6BC9A7',
    author: mockAuthors.self,
    visibility: 'private',
    favoriteCount: 0,
    rating: 0,
    lastReviewedAt: '2026-06-06T10:00:00Z',
    updatedAt: '2026-06-06T10:00:00Z',
  },
  {
    id: '6',
    title: 'Латинские термины в медицине',
    description: 'Базовая латынь для первокурсников медвуза',
    previewWords: ['Cor', 'Caput', 'Dorsum', 'Venter'],
    wordCount: 56,
    category: 'Медицина',
    track: 'medicine',
    progress: 0,
    type: 'text',
    color: '#E879A9',
    author: mockAuthors.dmitry,
    favoriteCount: 2100,
    rating: 4.9,
    lastReviewedAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-07T08:00:00Z',
  },
  {
    id: '7',
    title: 'Phrasal Verbs A2–B1',
    description: '50 частых фразовых глаголов с примерами',
    previewWords: ['give up', 'look after', 'run into', 'turn down'],
    wordCount: 50,
    category: 'Английский',
    track: 'languages',
    progress: 0,
    type: 'interactive',
    color: '#5B9FD4',
    author: mockAuthors.maria,
    favoriteCount: 980,
    rating: 4.7,
    lastReviewedAt: '2026-05-28T14:00:00Z',
    updatedAt: '2026-06-06T12:00:00Z',
  },
  {
    id: '8',
    title: 'Клеточное дыхание',
    description: 'Гликолиз, цикл Krebs и окислительное фосфорилирование',
    previewWords: ['АТФ', 'Митохондрия', 'NADH', 'Гликолиз'],
    wordCount: 24,
    category: 'Биология',
    track: 'university',
    progress: 0,
    type: 'interactive',
    color: '#6BC9A7',
    author: mockAuthors.dmitry,
    favoriteCount: 645,
    rating: 4.5,
    lastReviewedAt: '2026-06-04T11:00:00Z',
    updatedAt: '2026-06-05T16:00:00Z',
  },
  {
    id: '9',
    title: 'ЕГЭ · Органическая химия',
    description: 'Реакции и механизмы для подготовки к ЕГЭ',
    previewWords: ['Электрофил', 'Нуклеофил', 'Алкен', 'Спирт'],
    wordCount: 40,
    category: 'Химия',
    track: 'ege',
    progress: 0,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.maria,
    favoriteCount: 1520,
    rating: 4.8,
    lastReviewedAt: '2026-06-03T10:00:00Z',
    updatedAt: '2026-06-07T09:30:00Z',
  },
  {
    id: '10',
    title: 'Нервная система',
    description: 'Строение и функции ЦНС и ПНС',
    previewWords: ['Нейрон', 'Синапс', 'Миелин', 'Рефлекс'],
    wordCount: 32,
    category: 'Анатомия',
    track: 'medicine',
    progress: 0,
    type: 'interactive',
    color: '#9B8AFB',
    author: mockAuthors.dmitry,
    favoriteCount: 890,
    rating: 4.6,
    lastReviewedAt: '2026-06-02T08:00:00Z',
    updatedAt: '2026-06-04T18:00:00Z',
  },
  {
    id: '11',
    title: 'ЕГЭ · Биология — генетика',
    description: 'Законы Менделя, ДНК, мутации — типовые задания 21–28',
    previewWords: ['Аллель', 'Генотип', 'Кроссинг-over', 'Мутация'],
    wordCount: 45,
    category: 'Биология',
    track: 'ege',
    progress: 0,
    type: 'interactive',
    color: '#6BC9A7',
    author: mockAuthors.elena,
    favoriteCount: 3200,
    rating: 4.9,
    lastReviewedAt: '2026-06-05T10:00:00Z',
    updatedAt: '2026-06-08T09:00:00Z',
  },
  {
    id: '12',
    title: 'ЕГЭ · Русский — орфография',
    description: 'Правописание Н и НН, приставок, -тся/-ться',
    previewWords: ['Приставка', 'Корень', 'Суффикс', 'Окончание'],
    wordCount: 60,
    category: 'Русский язык',
    track: 'ege',
    progress: 0,
    type: 'text',
    color: '#E879A9',
    author: mockAuthors.elena,
    favoriteCount: 2800,
    rating: 4.8,
    lastReviewedAt: '2026-06-04T08:00:00Z',
    updatedAt: '2026-06-07T14:00:00Z',
  },
  {
    id: '13',
    title: 'ЕГЭ · Обществознание',
    description: 'Политика, экономика, право — ключевые термины',
    previewWords: ['Демократия', 'Гражданство', 'Конституция', 'Рынок'],
    wordCount: 55,
    category: 'Обществознание',
    track: 'ege',
    progress: 0,
    type: 'text',
    color: '#9B8AFB',
    author: mockAuthors.ivan,
    favoriteCount: 1950,
    rating: 4.7,
    lastReviewedAt: '2026-06-03T12:00:00Z',
    updatedAt: '2026-06-06T11:00:00Z',
  },
  {
    id: '14',
    title: 'ЕГЭ · Математика профиль',
    description: 'Производная, интеграл, стереометрия — формулы и определения',
    previewWords: ['Производная', 'Интеграл', 'Вектор', 'Скаляр'],
    wordCount: 48,
    category: 'Математика',
    track: 'ege',
    progress: 0,
    type: 'interactive',
    color: '#5B9FD4',
    author: mockAuthors.ivan,
    favoriteCount: 4100,
    rating: 4.9,
    lastReviewedAt: '2026-06-06T15:00:00Z',
    updatedAt: '2026-06-08T10:00:00Z',
  },
  {
    id: '15',
    title: 'ЕГЭ · История России XX век',
    description: 'Даты, личности, реформы — хронология для части C',
    previewWords: ['1905', '1917', 'НЭП', 'Перестройка'],
    wordCount: 70,
    category: 'История',
    track: 'ege',
    progress: 0,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.elena,
    favoriteCount: 1680,
    rating: 4.6,
    lastReviewedAt: '2026-06-01T11:00:00Z',
    updatedAt: '2026-06-05T09:00:00Z',
  },
  {
    id: '16',
    title: 'Высшая математика — пределы',
    description: 'Первый курс: определения, теоремы, типовые пределы',
    previewWords: ['Предел', 'Неопределённость', 'Эквивалентность', 'Lopital'],
    wordCount: 38,
    category: 'Математика',
    track: 'university',
    progress: 0,
    type: 'interactive',
    color: '#5B9FD4',
    author: mockAuthors.ivan,
    favoriteCount: 1240,
    rating: 4.7,
    lastReviewedAt: '2026-06-02T14:00:00Z',
    updatedAt: '2026-06-07T08:00:00Z',
  },
  {
    id: '17',
    title: 'Микроэкономика — 1 курс',
    description: 'Спрос, предложение, эластичность, рынки',
    previewWords: ['Спрос', 'Предложение', 'Эластичность', 'Монополия'],
    wordCount: 42,
    category: 'Экономика',
    track: 'university',
    progress: 0,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.elena,
    favoriteCount: 890,
    rating: 4.5,
    lastReviewedAt: '2026-05-30T10:00:00Z',
    updatedAt: '2026-06-04T16:00:00Z',
  },
  {
    id: '18',
    title: 'Философия — античность',
    description: 'Сократ, Платон, Аристотель для гуманитарных факультетов',
    previewWords: ['Бытие', 'Идея', 'Эidos', 'Диалектика'],
    wordCount: 30,
    category: 'Философия',
    track: 'university',
    progress: 0,
    type: 'text',
    color: '#9B8AFB',
    author: mockAuthors.ivan,
    favoriteCount: 520,
    rating: 4.4,
    lastReviewedAt: '2026-05-25T09:00:00Z',
    updatedAt: '2026-06-03T12:00:00Z',
  },
  {
    id: '19',
    title: 'Фармакология — группы препаратов',
    description: 'Классификация ЛС для 3–4 курса медфака',
    previewWords: ['Анальгетик', 'Антибиотик', 'Блокатор', 'Агонист'],
    wordCount: 65,
    category: 'Фармакология',
    track: 'medicine',
    progress: 0,
    type: 'interactive',
    color: '#E879A9',
    author: mockAuthors.dmitry,
    favoriteCount: 1780,
    rating: 4.8,
    lastReviewedAt: '2026-06-05T07:00:00Z',
    updatedAt: '2026-06-07T11:00:00Z',
  },
  {
    id: '20',
    title: 'Пропedevtika — физикальное обследование',
    description: 'Пальпация, перкуссия, auscultatio — термины и техника',
    previewWords: ['Пальпация', 'Перкуссия', 'Auscultatio', 'Inspectio'],
    wordCount: 28,
    category: 'Медицина',
    track: 'medicine',
    progress: 0,
    type: 'interactive',
    color: '#9B8AFB',
    author: mockAuthors.dmitry,
    favoriteCount: 1340,
    rating: 4.7,
    lastReviewedAt: '2026-06-04T06:00:00Z',
    updatedAt: '2026-06-06T08:00:00Z',
  },
  {
    id: '21',
    title: 'Скелет человека — зачёт',
    description: 'Кости черепа, позвоночник, конечности — к зачёту по анатомии',
    previewWords: ['Череп', 'Позвонок', 'Рёбра', 'Таз'],
    wordCount: 52,
    category: 'Анатомия',
    track: 'medicine',
    progress: 0,
    type: 'text',
    color: '#6BC9A7',
    author: mockAuthors.dmitry,
    favoriteCount: 960,
    rating: 4.6,
    lastReviewedAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-05T10:00:00Z',
  },
  {
    id: '22',
    title: 'Физика 9 класс — электричество',
    description: 'Закон Ома, цепи, мощность — к ОГЭ и ЕГЭ',
    previewWords: ['Сопротивление', 'Ток', 'Напряжение', 'Мощность'],
    wordCount: 35,
    category: 'Физика',
    track: 'school',
    progress: 0,
    type: 'interactive',
    color: '#5B9FD4',
    author: mockAuthors.elena,
    favoriteCount: 1120,
    rating: 4.7,
    lastReviewedAt: '2026-06-03T13:00:00Z',
    updatedAt: '2026-06-06T14:00:00Z',
  },
  {
    id: '23',
    title: 'География 10 класс — климат',
    description: 'Климатические пояса, типы климатов, монсоны',
    previewWords: ['Муссон', 'Пассат', 'Антициклон', 'Фронт'],
    wordCount: 40,
    category: 'География',
    track: 'school',
    progress: 0,
    type: 'text',
    color: '#6BC9A7',
    author: mockAuthors.elena,
    favoriteCount: 680,
    rating: 4.5,
    lastReviewedAt: '2026-05-28T10:00:00Z',
    updatedAt: '2026-06-04T09:00:00Z',
  },
  {
    id: '24',
    title: 'Алгебра 8 класс — квадратные уравнения',
    description: 'Дискриминант, теорема Виета, разложение на множители',
    previewWords: ['Дискриминант', 'Корень', 'Виета', 'Тождество'],
    wordCount: 25,
    category: 'Математика',
    track: 'school',
    progress: 0,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.ivan,
    favoriteCount: 1450,
    rating: 4.8,
    lastReviewedAt: '2026-06-02T11:00:00Z',
    updatedAt: '2026-06-07T07:00:00Z',
  },
  {
    id: '25',
    title: 'Deutsch A2 — Alltag',
    description: 'Повседневная лексика: дом, работа, покупки',
    previewWords: ['der Markt', 'die Arbeit', 'kaufen', 'Wohnung'],
    wordCount: 55,
    category: 'Немецкий',
    track: 'languages',
    progress: 0,
    type: 'interactive',
    color: '#F5B84C',
    author: mockAuthors.maria,
    favoriteCount: 740,
    rating: 4.6,
    lastReviewedAt: '2026-05-27T12:00:00Z',
    updatedAt: '2026-06-05T15:00:00Z',
  },
  {
    id: '26',
    title: 'Français B1 — Verbes',
    description: 'Спряжение и времена: présent, passé composé, imparfait',
    previewWords: ['être', 'avoir', 'aller', 'faire'],
    wordCount: 48,
    category: 'Французский',
    track: 'languages',
    progress: 0,
    type: 'text',
    color: '#E879A9',
    author: mockAuthors.maria,
    favoriteCount: 620,
    rating: 4.5,
    lastReviewedAt: '2026-05-26T10:00:00Z',
    updatedAt: '2026-06-03T16:00:00Z',
  },
  {
    id: '27',
    title: 'Python для начинающих',
    description: 'Типы, циклы, функции — базовый синтаксис',
    previewWords: ['list', 'dict', 'def', 'lambda'],
    wordCount: 36,
    category: 'Программирование',
    track: 'profession',
    progress: 0,
    type: 'interactive',
    color: '#5B9FD4',
    author: mockAuthors.ivan,
    favoriteCount: 5200,
    rating: 4.9,
    lastReviewedAt: '2026-06-07T10:00:00Z',
    updatedAt: '2026-06-08T11:00:00Z',
  },
  {
    id: '28',
    title: 'Гражданское право — основы',
    description: 'Сделки, собственность, обязательства для юрфака',
    previewWords: ['Сделка', 'Собственность', 'Договор', 'Иск'],
    wordCount: 44,
    category: 'Право',
    track: 'profession',
    progress: 0,
    type: 'text',
    color: '#9B8AFB',
    author: mockAuthors.elena,
    favoriteCount: 880,
    rating: 4.6,
    lastReviewedAt: '2026-06-01T14:00:00Z',
    updatedAt: '2026-06-06T09:00:00Z',
  },
  {
    id: '29',
    title: 'Бухгалтерский учёт — проводки',
    description: 'Счета, дебет, кредит для бухгалтеров и экономистов',
    previewWords: ['Дебет', 'Кредит', 'Баланс', 'Оборот'],
    wordCount: 50,
    category: 'Экономика',
    track: 'profession',
    progress: 0,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.elena,
    favoriteCount: 710,
    rating: 4.4,
    lastReviewedAt: '2026-05-29T09:00:00Z',
    updatedAt: '2026-06-04T11:00:00Z',
  },
  {
    id: '30',
    title: 'Педагогика — методики',
    description: 'Для студентов педвуза: ЗUN, ФГОС, рефлексия',
    previewWords: ['ЗUN', 'ФГОС', 'Рефлексия', 'Метапредмет'],
    wordCount: 32,
    category: 'Педагогика',
    track: 'profession',
    progress: 0,
    type: 'interactive',
    color: '#6BC9A7',
    author: mockAuthors.ivan,
    favoriteCount: 430,
    rating: 4.3,
    lastReviewedAt: '2026-05-24T11:00:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
  },
  {
    id: '31',
    title: 'Нервы верхней конечности',
    description:
      'Плечевое сплетение, основные периферические нервы и зоны их иннервации для практикумов.',
    previewWords: ['Плечевое сплетение', 'Лучевой нерв', 'Срединный нерв', 'Локтевой нерв'],
    wordCount: 14,
    category: 'Анатомия',
    track: 'medicine',
    progress: 36,
    type: 'interactive',
    color: '#5B9FD4',
    author: mockAuthors.self,
    visibility: 'public',
    favoriteCount: 0,
    rating: 0,
    folderId: 'f1',
    lastReviewedAt: '2026-06-19T08:00:00Z',
    updatedAt: '2026-06-19T08:00:00Z',
  },
]

function getAllModules(): Module[] {
  const userModules = userModuleRepository.loadAll()
  const userIds = new Set(userModules.map((m) => m.id))
  return [...userModules, ...mockModules.filter((m) => !userIds.has(m.id))]
}

function getOwnModules(): Module[] {
  return getAllModules().filter((module) => module.author.id === mockUser.id)
}

function getOwnLibraryFolders(ownModules: Module[]): LibraryFolder[] {
  const folderIds = new Set(
    ownModules.map((module) => module.folderId).filter((id): id is string => Boolean(id)),
  )

  return mockFolders
    .filter((folder) => folderIds.has(folder.id))
    .map((folder) => ({
      ...folder,
      moduleCount: ownModules.filter((module) => module.folderId === folder.id).length,
    }))
}

function getModuleById(id: string): Module | undefined {
  const fromUser = userModuleRepository.loadAll().find((module) => module.id === id)
  if (fromUser) return fromUser
  return mockModules.find((module) => module.id === id)
}

function loadSeedFlashcards(module: Module): Flashcard[] {
  const contentModuleId = module.sourceModuleId ?? module.id
  const contentModule = getModuleById(contentModuleId)
  if (!contentModule || contentModule.wordCount === 0) return []
  return getFlashcardsForModule(contentModule.id, contentModule.previewWords)
}

function loadModuleFlashcards(module: Module): Flashcard[] {
  const seed = loadSeedFlashcards(module)
  const persisted = cardRepository.loadCards(module.id)

  if (persisted && persisted.length > 0) {
    return mergeModuleCards(seed, persisted)
  }

  if (module.sourceModuleId) {
    return mergeModuleCards(seed, null)
  }

  if (module.wordCount > 0) {
    return seed
  }

  return []
}

export const mockFolders: LibraryFolder[] = [
  {
    id: 'f1',
    name: 'Медицина',
    description: 'Анатомия и биология',
    moduleCount: 3,
    color: '#9B8AFB',
  },
  {
    id: 'f2',
    name: 'Языки',
    description: 'Английский',
    moduleCount: 1,
    color: '#F5B84C',
  },
  {
    id: 'f3',
    name: 'ЕГЭ · Химия',
    description: 'Подготовка к экзамену',
    moduleCount: 1,
    color: '#5B9FD4',
  },
]

function bumpModuleFavoriteCount(moduleId: string, delta: number): void {
  const module = mockModules.find((m) => m.id === moduleId)
  if (module) {
    module.favoriteCount = Math.max(0, module.favoriteCount + delta)
  }
}

function setModuleRating(moduleId: string, rating: number): void {
  const module = mockModules.find((m) => m.id === moduleId)
  if (module) {
    module.rating = rating
  }
}

export const modulesApi = createApi({
  reducerPath: 'modulesApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Modules', 'User', 'ModuleFavorites', 'ModuleRatings'],
  endpoints: (builder) => ({
    getRecentModules: builder.query<Module[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return { data: getAllModules() }
      },
      providesTags: ['Modules'],
    }),
    getGlobalModules: builder.query<{ modules: Module[]; currentUserId: string }, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 280))
        return {
          data: {
            modules: getAllModules(),
            currentUserId: mockUser.id,
          },
        }
      },
      providesTags: ['Modules'],
    }),
    getLibraryModules: builder.query<Module[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        return {
          data: [...getOwnModules()].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        }
      },
      providesTags: ['Modules'],
    }),
    getLibraryFolders: builder.query<LibraryFolder[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
        return { data: getOwnLibraryFolders(getOwnModules()) }
      },
      providesTags: ['Modules'],
    }),
    getCurrentUser: builder.query<User, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { data: mockUser }
      },
      providesTags: ['User'],
    }),
    searchModules: builder.query<Module[], string>({
      queryFn: async (search) => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        const query = search.toLowerCase().trim()
        const all = getAllModules()
        const filtered = query
          ? all.filter(
              (m) =>
                m.title.toLowerCase().includes(query) ||
                m.category.toLowerCase().includes(query) ||
                m.description.toLowerCase().includes(query) ||
                m.previewWords.some((w) => w.toLowerCase().includes(query)),
            )
          : all
        return { data: filtered }
      },
    }),
    getModule: builder.query<ModuleDetail, string>({
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        const module = getAllModules().find((m) => m.id === id)
        if (!module) {
          return { error: { status: 404, data: 'Module not found' } }
        }
        const flashcards = loadModuleFlashcards(module)
        return { data: { module, flashcards } }
      },
      providesTags: (_result, _error, id) => [{ type: 'Modules', id }],
    }),
    copyModuleToLibrary: builder.mutation<Module, string>({
      queryFn: async (moduleId) => {
        await new Promise((resolve) => setTimeout(resolve, 150))

        const source = getModuleById(moduleId)
        if (!source) {
          return { error: { status: 404, data: 'Module not found' } }
        }

        const canonicalSourceId = source.sourceModuleId ?? source.id

        if (source.author.id === mockUser.id && !source.sourceModuleId) {
          return { error: { status: 400, data: 'Already in library' } }
        }

        const existing = userModuleRepository
          .loadAll()
          .find((module) => module.sourceModuleId === canonicalSourceId)
        if (existing) {
          return { data: existing }
        }

        const contentModule = getModuleById(canonicalSourceId)
        if (!contentModule) {
          return { error: { status: 404, data: 'Source module not found' } }
        }

        const now = new Date().toISOString()
        const copy: Module = {
          ...contentModule,
          id: getLinkedCopyId(canonicalSourceId),
          sourceModuleId: canonicalSourceId,
          author: mockAuthors.self,
          visibility: 'private',
          progress: 0,
          favoriteCount: 0,
          rating: 0,
          folderId: undefined,
          lastReviewedAt: now,
          updatedAt: now,
        }

        userModuleRepository.save(copy)
        return { data: copy }
      },
      invalidatesTags: ['Modules'],
    }),
    getModuleFavorites: builder.query<string[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return { data: moduleFavoritesRepository.loadAll() }
      },
      providesTags: ['ModuleFavorites'],
    }),
    toggleModuleFavorite: builder.mutation<{ moduleId: string; favorited: boolean }, string>({
      queryFn: async (moduleId) => {
        await new Promise((resolve) => setTimeout(resolve, 80))
        const favorited = moduleFavoritesRepository.toggle(moduleId)
        bumpModuleFavoriteCount(moduleId, favorited ? 1 : -1)
        return { data: { moduleId, favorited } }
      },
      invalidatesTags: ['ModuleFavorites'],
      async onQueryStarted(moduleId, { dispatch, queryFulfilled }) {
        const wasFavorited = moduleFavoritesRepository.isFavorited(moduleId)
        const delta = wasFavorited ? -1 : 1

        const applyCount = (m: Module) => {
          if (m.id === moduleId) {
            m.favoriteCount = Math.max(0, m.favoriteCount + delta)
          }
        }

        const favoritePatch = dispatch(
          modulesApi.util.updateQueryData('getModuleFavorites', undefined, (draft) => {
            if (wasFavorited) {
              return draft.filter((id) => id !== moduleId)
            }
            draft.push(moduleId)
          }),
        )
        const countPatches = [
          dispatch(
            modulesApi.util.updateQueryData('getRecentModules', undefined, (draft) => {
              draft.forEach(applyCount)
            }),
          ),
          dispatch(
            modulesApi.util.updateQueryData('getLibraryModules', undefined, (draft) => {
              draft.forEach(applyCount)
            }),
          ),
          dispatch(
            modulesApi.util.updateQueryData('getGlobalModules', undefined, (draft) => {
              draft.modules.forEach(applyCount)
            }),
          ),
          dispatch(
            modulesApi.util.updateQueryData('getModule', moduleId, (draft) => {
              if (draft) applyCount(draft.module)
            }),
          ),
        ]

        try {
          await queryFulfilled
        } catch {
          favoritePatch.undo()
          countPatches.forEach((patch) => patch.undo())
        }
      },
    }),
    getModuleRatings: builder.query<Record<string, number>, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return { data: moduleRatingsRepository.loadUserRatings() }
      },
      providesTags: ['ModuleRatings'],
    }),
    rateModule: builder.mutation<
      { moduleId: string; rating: number; averageRating: number },
      { moduleId: string; rating: number }
    >({
      queryFn: async ({ moduleId, rating }) => {
        await new Promise((resolve) => setTimeout(resolve, 80))
        const module = getAllModules().find((m) => m.id === moduleId)
        if (!module) {
          return { error: { status: 404, data: 'Module not found' } }
        }
        const result = moduleRatingsRepository.rate(moduleId, rating, module)
        setModuleRating(moduleId, result.averageRating)
        return {
          data: {
            moduleId,
            rating: result.userRating,
            averageRating: result.averageRating,
          },
        }
      },
      invalidatesTags: ['ModuleRatings'],
      async onQueryStarted({ moduleId, rating }, { dispatch, queryFulfilled }) {
        const module = getAllModules().find((m) => m.id === moduleId)
        if (!module) return

        const preview = moduleRatingsRepository.previewRate(moduleId, rating, module)

        const applyRating = (m: Module) => {
          if (m.id === moduleId) {
            m.rating = preview.averageRating
          }
        }

        const ratingsPatch = dispatch(
          modulesApi.util.updateQueryData('getModuleRatings', undefined, (draft) => {
            draft[moduleId] = preview.userRating
          }),
        )
        const ratingPatches = [
          dispatch(
            modulesApi.util.updateQueryData('getRecentModules', undefined, (draft) => {
              draft.forEach(applyRating)
            }),
          ),
          dispatch(
            modulesApi.util.updateQueryData('getLibraryModules', undefined, (draft) => {
              draft.forEach(applyRating)
            }),
          ),
          dispatch(
            modulesApi.util.updateQueryData('getGlobalModules', undefined, (draft) => {
              draft.modules.forEach(applyRating)
            }),
          ),
          dispatch(
            modulesApi.util.updateQueryData('getModule', moduleId, (draft) => {
              if (draft) applyRating(draft.module)
            }),
          ),
        ]

        try {
          await queryFulfilled
        } catch {
          ratingsPatch.undo()
          ratingPatches.forEach((patch) => patch.undo())
        }
      },
    }),
  }),
})

export const {
  useGetRecentModulesQuery,
  useGetGlobalModulesQuery,
  useGetLibraryModulesQuery,
  useGetLibraryFoldersQuery,
  useGetCurrentUserQuery,
  useSearchModulesQuery,
  useGetModuleQuery,
  useCopyModuleToLibraryMutation,
  useGetModuleFavoritesQuery,
  useToggleModuleFavoriteMutation,
  useGetModuleRatingsQuery,
  useRateModuleMutation,
} = modulesApi
