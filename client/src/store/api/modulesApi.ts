import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { getFlashcardsForModule } from '../../lib/mockFlashcards'
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
}

const mockAuthors = {
  self: { id: '1', name: 'Александр' },
  maria: { id: '2', name: 'Мария', avatarUrl: 'https://i.pravatar.cc/80?img=5' },
  dmitry: { id: '3', name: 'Дмитрий', avatarUrl: 'https://i.pravatar.cc/80?img=12' },
} as const

export const mockModules: Module[] = [
  {
    id: '1',
    title: 'Кости верхней конечности',
    description: 'Названия и расположение костей плеча, предплечья и кисти',
    previewWords: ['Плечевая', 'Локтевая', 'Лучевая', 'Запястные'],
    wordCount: 28,
    category: 'Анатомия',
    progress: 72,
    type: 'interactive',
    color: '#9B8AFB',
    author: mockAuthors.self,
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
    progress: 45,
    type: 'text',
    color: '#F5B84C',
    author: mockAuthors.maria,
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
    progress: 90,
    type: 'interactive',
    author: mockAuthors.dmitry,
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
    progress: 28,
    type: 'text',
    author: mockAuthors.maria,
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
    lastReviewedAt: '2026-06-06T10:00:00Z',
    updatedAt: '2026-06-06T10:00:00Z',
  },
]

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

export const modulesApi = createApi({
  reducerPath: 'modulesApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Modules', 'User'],
  endpoints: (builder) => ({
    getRecentModules: builder.query<Module[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300))
        return { data: mockModules }
      },
      providesTags: ['Modules'],
    }),
    getLibraryModules: builder.query<Module[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 250))
        return {
          data: [...mockModules].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          ),
        }
      },
      providesTags: ['Modules'],
    }),
    getLibraryFolders: builder.query<LibraryFolder[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
        return { data: mockFolders }
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
        const filtered = query
          ? mockModules.filter(
              (m) =>
                m.title.toLowerCase().includes(query) ||
                m.category.toLowerCase().includes(query) ||
                m.description.toLowerCase().includes(query) ||
                m.previewWords.some((w) => w.toLowerCase().includes(query)),
            )
          : mockModules
        return { data: filtered }
      },
    }),
    getModule: builder.query<ModuleDetail, string>({
      queryFn: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 200))
        const module = mockModules.find((m) => m.id === id)
        if (!module) {
          return { error: { status: 404, data: 'Module not found' } }
        }
        const flashcards =
          module.wordCount > 0
            ? getFlashcardsForModule(module.id, module.previewWords)
            : []
        return { data: { module, flashcards } }
      },
      providesTags: (_result, _error, id) => [{ type: 'Modules', id }],
    }),
  }),
})

export const {
  useGetRecentModulesQuery,
  useGetLibraryModulesQuery,
  useGetLibraryFoldersQuery,
  useGetCurrentUserQuery,
  useSearchModulesQuery,
  useGetModuleQuery,
} = modulesApi
