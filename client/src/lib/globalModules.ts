import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  Flame,
  GraduationCap,
  HeartPulse,
  Languages,
  Rocket,
  School,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import type { Module, ModuleTrack } from '../types/module'

export type GlobalCollectionKind = 'featured' | 'track' | 'curated'

export interface GlobalModuleCollection {
  id: string
  title: string
  subtitle: string
  modules: Module[]
  kind: GlobalCollectionKind
  accent: string
  accentLight: string
  icon: LucideIcon
  badge?: string
}

export interface GlobalTrackMeta {
  id: ModuleTrack
  title: string
  subtitle: string
}

export const GLOBAL_TRACKS: GlobalTrackMeta[] = [
  {
    id: 'ege',
    title: 'Подготовка к ЕГЭ',
    subtitle: 'Биология, химия, русский, обществознание и другие предметы',
  },
  {
    id: 'university',
    title: 'Для вуза',
    subtitle: 'Курсовые темы, зачёты и экзамены первых–третьих курсов',
  },
  {
    id: 'medicine',
    title: 'Медики',
    subtitle: 'Анатомия, латынь, фармакология — для медвуза и ординатуры',
  },
  {
    id: 'school',
    title: 'Школьная программа',
    subtitle: '5–11 класс: базовые определения и термины',
  },
  {
    id: 'languages',
    title: 'Иностранные языки',
    subtitle: 'Лексика и грамматика для A2–C1',
  },
  {
    id: 'profession',
    title: 'Профессия и навыки',
    subtitle: 'IT, право, экономика, педагогика',
  },
]

const TRACK_VISUALS: Record<
  ModuleTrack,
  { accent: string; accentLight: string; icon: LucideIcon; badge: string }
> = {
  ege: { accent: '#7F77DD', accentLight: '#f5f3ff', icon: GraduationCap, badge: 'ЕГЭ' },
  university: { accent: '#5B9FD4', accentLight: '#eff6ff', icon: BookOpen, badge: 'Вуз' },
  medicine: { accent: '#E879A9', accentLight: '#fdf2f8', icon: HeartPulse, badge: 'Медики' },
  school: { accent: '#6BC9A7', accentLight: '#ecfdf5', icon: School, badge: 'Школа' },
  languages: { accent: '#F5B84C', accentLight: '#fffbeb', icon: Languages, badge: 'Языки' },
  profession: { accent: '#534AB7', accentLight: '#eef0ff', icon: Briefcase, badge: 'Карьера' },
}

const CURATED_VISUALS: Record<
  string,
  { accent: string; accentLight: string; icon: LucideIcon; badge?: string }
> = {
  popular: { accent: '#7F77DD', accentLight: '#f5f3ff', icon: Flame, badge: 'Хит' },
  'top-rated': { accent: '#F5B84C', accentLight: '#fffbeb', icon: Star, badge: 'Топ' },
  editors: { accent: '#534AB7', accentLight: '#eef0ff', icon: Trophy, badge: 'Редакция' },
  new: { accent: '#6BC9A7', accentLight: '#ecfdf5', icon: Sparkles, badge: 'Новое' },
  interactive: { accent: '#5B9FD4', accentLight: '#eff6ff', icon: Zap },
  'quick-start': { accent: '#E879A9', accentLight: '#fdf2f8', icon: Rocket, badge: '30 мин' },
}

function byFavorite(a: Module, b: Module): number {
  return b.favoriteCount - a.favoriteCount
}

function byRating(a: Module, b: Module): number {
  return b.rating - a.rating || b.favoriteCount - a.favoriteCount
}

function byUpdated(a: Module, b: Module): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
}

/** Публичные модули других авторов (не текущего пользователя) */
export function filterGlobalModules(modules: Module[], currentUserId: string): Module[] {
  return modules.filter((m) => m.author.id !== currentUserId && m.wordCount > 0)
}

function buildCollectionModules(
  global: Module[],
  id: string,
  previewLimit?: number,
): Module[] {
  let list: Module[] = []

  if (id === 'popular') {
    list = [...global].sort(byFavorite)
  } else if (id.startsWith('track-')) {
    const trackId = id.replace('track-', '') as ModuleTrack
    list = global.filter((m) => m.track === trackId).sort(byFavorite)
  } else if (id === 'top-rated') {
    list = global.filter((m) => m.rating >= 4.5).sort(byRating)
  } else if (id === 'editors') {
    list = global.filter((m) => m.rating >= 4.7 && m.favoriteCount >= 800).sort(byRating)
  } else if (id === 'new') {
    list = [...global].sort(byUpdated)
  } else if (id === 'interactive') {
    list = global.filter((m) => m.type === 'interactive').sort(byFavorite)
  } else if (id === 'quick-start') {
    list = global.filter((m) => m.wordCount <= 30).sort(byRating)
  }

  return previewLimit != null ? list.slice(0, previewLimit) : list
}

function collectionMeta(id: string): Pick<GlobalModuleCollection, 'accent' | 'accentLight' | 'icon' | 'badge'> {
  if (id.startsWith('track-')) {
    const trackId = id.replace('track-', '') as ModuleTrack
    return TRACK_VISUALS[trackId]
  }
  return CURATED_VISUALS[id] ?? { accent: '#7F77DD', accentLight: '#f5f3ff', icon: BookOpen }
}

export function buildGlobalModuleCollections(
  modules: Module[],
  currentUserId: string,
  previewLimit = 8,
): GlobalModuleCollection[] {
  const global = filterGlobalModules(modules, currentUserId)
  if (global.length === 0) return []

  const trackCollections: GlobalModuleCollection[] = GLOBAL_TRACKS.map((track) => {
    const id = `track-${track.id}`
    const visual = TRACK_VISUALS[track.id]
    return {
      id,
      title: track.title,
      subtitle: track.subtitle,
      modules: buildCollectionModules(global, id, previewLimit),
      kind: 'track' as const,
      ...visual,
    }
  }).filter((c) => c.modules.length > 0)

  const curatedDefs: { id: string; title: string; subtitle: string; kind: GlobalCollectionKind }[] = [
    {
      id: 'popular',
      title: 'Популярные сейчас',
      subtitle: 'Самые сохраняемые модули за последнее время',
      kind: 'featured',
    },
    {
      id: 'top-rated',
      title: 'Лучшие по оценкам',
      subtitle: 'Рейтинг 4.5+ от пользователей сообщества',
      kind: 'curated',
    },
    {
      id: 'editors',
      title: 'Выбор редакции',
      subtitle: 'Проверенные наборы с высоким качеством карточек',
      kind: 'curated',
    },
    {
      id: 'new',
      title: 'Недавно добавленные',
      subtitle: 'Свежее от авторов сообщества',
      kind: 'curated',
    },
    {
      id: 'interactive',
      title: 'Интерактивные',
      subtitle: 'Модули с играми и интерактивными режимами',
      kind: 'curated',
    },
    {
      id: 'quick-start',
      title: 'Быстрый старт',
      subtitle: 'Компактные наборы до 30 карточек — можно пройти за один вечер',
      kind: 'curated',
    },
  ]

  const collections: GlobalModuleCollection[] = [
    ...curatedDefs.map((def) => ({
      ...def,
      modules: buildCollectionModules(global, def.id, previewLimit),
      ...collectionMeta(def.id),
    })),
    ...trackCollections,
  ]

  return collections.filter((c) => c.modules.length > 0)
}

export function findGlobalCollection(
  collectionId: string,
  modules: Module[],
  currentUserId: string,
): GlobalModuleCollection | null {
  const preview = buildGlobalModuleCollections(modules, currentUserId, 1)
  const match = preview.find((c) => c.id === collectionId)
  if (!match) return null

  const global = filterGlobalModules(modules, currentUserId)
  return {
    ...match,
    modules: buildCollectionModules(global, collectionId),
  }
}

export function splitCollectionsForHome(collections: GlobalModuleCollection[]) {
  const popular = collections.find((c) => c.id === 'popular') ?? null
  const tracks = collections.filter((c) => c.kind === 'track')
  const curated = collections.filter((c) => c.kind === 'curated')
  return { popular, tracks, curated }
}

export function collectionStats(modules: Module[]) {
  if (modules.length === 0) return { avgRating: 0, totalCards: 0 }
  const avgRating =
    Math.round((modules.reduce((s, m) => s + m.rating, 0) / modules.length) * 10) / 10
  const totalCards = modules.reduce((s, m) => s + m.wordCount, 0)
  return { avgRating, totalCards }
}
