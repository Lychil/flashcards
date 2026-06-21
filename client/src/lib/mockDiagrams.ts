import type { DiagramMarker } from '../types/diagram'
import type { ModuleAuthor } from '../types/module'

type ReviewMode = 'label-recall' | 'zone-pick'

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function mockUploadedDiagramImage(accent: string, accentSoft: string): string {
  return svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560">
      <rect width="900" height="560" rx="38" fill="${accentSoft}"/>
      <rect x="86" y="70" width="728" height="420" rx="28" fill="#fff" opacity=".72"/>
      <path d="M154 380c92-106 181-128 267-66 78 56 147 44 230-60 36-45 66-66 94-73" fill="none" stroke="${accent}" stroke-width="30" stroke-linecap="round" opacity=".22"/>
      <path d="M158 196h238M158 246h164M158 431h318" stroke="#FFFFFF" stroke-width="24" stroke-linecap="round" opacity=".8"/>
      <circle cx="612" cy="184" r="86" fill="${accent}" opacity=".16"/>
      <circle cx="676" cy="336" r="54" fill="${accent}" opacity=".12"/>
      <path d="M270 132h360" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity=".16"/>
    </svg>
  `)
}

export interface MockDiagram {
  id: string
  sourceDiagramId?: string
  ownerId?: string
  title: string
  description: string
  author: ModuleAuthor
  subject: string
  accent: string
  accentSoft: string
  updatedAt: string
  imageDataUrl: string
  markers: DiagramMarker[]
  reviewMode: ReviewMode
}

export const mockDiagrams: MockDiagram[] = [
  {
    id: '1',
    title: 'Строение сердца',
    description: 'Загруженная схема с точками камер, клапана и аорты.',
    author: { id: '3', name: 'Дмитрий' },
    subject: 'Анатомия',
    accent: '#E85D75',
    accentSoft: '#FDECEF',
    updatedAt: 'Сегодня',
    reviewMode: 'label-recall',
    imageDataUrl: mockUploadedDiagramImage('#E85D75', '#FDECEF'),
    markers: [
      {
        id: 'left-atrium',
        type: 'point',
        label: 'Левое предсердие',
        hint: 'Верхняя камера, принимает кровь из лёгочных вен.',
        x: 0.58,
        y: 0.34,
        points: [],
      },
      {
        id: 'right-atrium',
        type: 'point',
        label: 'Правое предсердие',
        hint: 'Верхняя камера, куда приходит венозная кровь.',
        x: 0.39,
        y: 0.36,
        points: [],
      },
      {
        id: 'left-ventricle',
        type: 'point',
        label: 'Левый желудочек',
        hint: 'Самая мощная камера сердца.',
        x: 0.6,
        y: 0.68,
        points: [],
      },
      {
        id: 'aorta',
        type: 'point',
        label: 'Аорта',
        hint: 'Главная артерия, выходит сверху из сердца.',
        x: 0.52,
        y: 0.18,
        points: [],
      },
      {
        id: 'mitral-valve',
        type: 'point',
        label: 'Митральный клапан',
        hint: 'Клапан между левыми камерами.',
        x: 0.55,
        y: 0.5,
        points: [],
      },
    ],
  },
  {
    id: '2',
    title: 'Карта Европы',
    description: 'SVG-карта с зонами стран, как после разметки в редакторе.',
    author: { id: '4', name: 'Елена' },
    subject: 'География',
    accent: '#4E8DEB',
    accentSoft: '#ECF4FF',
    updatedAt: 'Вчера',
    reviewMode: 'zone-pick',
    imageDataUrl: mockUploadedDiagramImage('#4E8DEB', '#ECF4FF'),
    markers: [
      {
        id: 'france',
        type: 'zone',
        label: 'Франция',
        hint: 'Запад Европы, между Испанией, Германией и Бельгией.',
        x: 0.35,
        y: 0.58,
        color: '#8EBDEA',
        points: [
          { x: 0.26, y: 0.48 },
          { x: 0.34, y: 0.38 },
          { x: 0.43, y: 0.53 },
          { x: 0.39, y: 0.73 },
          { x: 0.27, y: 0.7 },
        ],
      },
      {
        id: 'germany',
        type: 'zone',
        label: 'Германия',
        hint: 'Центральная Европа, восточнее Франции.',
        x: 0.48,
        y: 0.5,
        color: '#73A9E1',
        points: [
          { x: 0.44, y: 0.43 },
          { x: 0.54, y: 0.42 },
          { x: 0.61, y: 0.54 },
          { x: 0.56, y: 0.7 },
          { x: 0.47, y: 0.67 },
        ],
      },
      {
        id: 'italy',
        type: 'point',
        label: 'Италия',
        hint: 'Полуостров на юге, форма “сапога”.',
        x: 0.52,
        y: 0.72,
        points: [],
      },
      {
        id: 'spain',
        type: 'zone',
        label: 'Испания',
        hint: 'Пиренейский полуостров на юго-западе.',
        x: 0.25,
        y: 0.75,
        color: '#5F9BDB',
        points: [
          { x: 0.18, y: 0.68 },
          { x: 0.29, y: 0.69 },
          { x: 0.36, y: 0.82 },
          { x: 0.28, y: 0.91 },
          { x: 0.16, y: 0.82 },
        ],
      },
      {
        id: 'poland',
        type: 'point',
        label: 'Польша',
        hint: 'Восточнее Германии, севернее Чехии.',
        x: 0.62,
        y: 0.48,
        points: [],
      },
      {
        id: 'norway',
        type: 'point',
        label: 'Норвегия',
        hint: 'Скандинавия, вытянута вдоль северного моря.',
        x: 0.51,
        y: 0.18,
        points: [],
      },
    ],
  },
  {
    id: '3',
    title: 'Растительная клетка',
    description: 'Изображение клетки с несколькими подписанными зонами.',
    author: { id: '2', name: 'Мария' },
    subject: 'Биология',
    accent: '#35A978',
    accentSoft: '#ECF8F2',
    updatedAt: '2 дня назад',
    reviewMode: 'label-recall',
    imageDataUrl: mockUploadedDiagramImage('#35A978', '#ECF8F2'),
    markers: [
      {
        id: 'nucleus',
        type: 'point',
        label: 'Ядро',
        hint: 'Крупная структура с генетической информацией.',
        x: 0.46,
        y: 0.49,
        points: [],
      },
      {
        id: 'chloroplast',
        type: 'point',
        label: 'Хлоропласт',
        hint: 'Зелёный органоид фотосинтеза.',
        x: 0.65,
        y: 0.37,
        points: [],
      },
      {
        id: 'vacuole',
        type: 'point',
        label: 'Вакуоль',
        hint: 'Большой резервуар внутри растительной клетки.',
        x: 0.58,
        y: 0.63,
        points: [],
      },
      {
        id: 'cell-wall',
        type: 'zone',
        label: 'Клеточная стенка',
        hint: 'Жёсткая внешняя оболочка.',
        x: 0.24,
        y: 0.34,
        color: '#35A978',
        points: [
          { x: 0.16, y: 0.28 },
          { x: 0.36, y: 0.18 },
          { x: 0.69, y: 0.24 },
          { x: 0.81, y: 0.52 },
          { x: 0.62, y: 0.78 },
          { x: 0.28, y: 0.72 },
        ],
      },
    ],
  },
]

export function getMockDiagramById(id: string): MockDiagram | undefined {
  return mockDiagrams.find((diagram) => diagram.id === id)
}
