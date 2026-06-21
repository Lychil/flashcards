# Backend contract notes

Документ описывает текущий frontend-only проект и то, какой backend нужен, чтобы заменить моки, `localStorage` и `fakeBaseQuery`.

## Текущее состояние

Проект состоит из одного клиента: `client/` на React, Vite, Redux Toolkit и React Router. Реального backend-пакета нет.

Источники данных сейчас делятся на два слоя:

- `client/src/store/api/modulesApi.ts` — RTK Query API с `fakeBaseQuery`, моками пользователя, модулей и папок.
- `client/src/services/*Repository.ts` — репозитории поверх `localStorage` для карточек, диаграмм, плана экзамена, избранного, рейтингов, AI-квоты и дневных счетчиков.

Главная задача backend v1 — сделать сервер авторитетным источником для пользователя, модулей, карточек/SRS, библиотеки, диаграмм, рейтингов, избранного, экзаменационного плана и AI-генерации.

## Моки и seed-данные

### Modules

Файл: `client/src/store/api/modulesApi.ts`

Содержит:

- `mockUser` — текущий пользователь `id = "1"`, premium включен.
- `mockAuthors` — авторы для публичного каталога.
- `mockModules` — 30+ модулей с категориями, аудиториями, прогрессом, рейтингом, количеством избранных и visibility.
- `mockFolders` — 3 папки библиотеки.

Сейчас этот файл одновременно имитирует API, хранит большой объем seed-данных и содержит mutations для copy/favorite/rating. В backend-версии эти данные должны уйти в API и сидирование базы.

### Flashcards

Файл: `client/src/lib/mockFlashcards.ts`

Содержит seed-карточки для части модулей. Для остальных модулей карточки синтезируются из `previewWords`.

Карточки пользователя сохраняются локально по ключу:

```text
flashcards:cards:{moduleId}
```

Важно для backend: карточки и SRS-прогресс должны быть привязаны не только к каноническому модулю, но и к пользовательской копии/пользователю. Сейчас copy-модуль получает свой `moduleId`, а карточки читаются по этому id.

### Diagrams

Файл: `client/src/lib/mockDiagrams.ts`

Содержит публичные диаграммы каталога. Тип полной сущности вынесен в `client/src/types/diagram.ts` как `Diagram`.

Сейчас картинки хранятся как `data:image/svg+xml`. Для production backend лучше использовать загрузку файла в object storage и отдавать `imageUrl`.

Пользовательские диаграммы сохраняются локально по ключу:

```text
flashcards:user-diagrams
```

### Exam plan

Файл: `client/src/lib/mockExamPlan.ts`

Содержит демо-план подготовки, нормализацию схемы и mock-настройки. Сам план сохраняется по ключу:

```text
flashcards:exam-plan
```

Расписание, прогноз и readiness curve сейчас вычисляются на клиенте в `client/src/lib/fsrsPlanner.ts` и связанных файлах.

### AI generation

Файлы:

- `client/src/services/aiGenerationService.ts`
- `client/src/services/generationQuotaRepository.ts`

Генерация имитируется на клиенте. Есть fallback-карточки и простые эвристики разбора текста/URL. Квота сохраняется по ключу:

```text
flashcards:ai-generation-quota
```

Backend должен заменить это реальным endpoint генерации, учетом квот и, возможно, streaming-протоколом.

### Static UI mocks

Дополнительные статичные данные:

- `client/src/components/layout/AppNotificationsPopup.tsx` — уведомления.
- `client/src/pages/SubscriptionPage.tsx` — тарифы и маркетинговый текст.
- `client/src/pages/AuthPage.tsx` — UI входа без реальной сессии.

## Доменные типы

### Common

Файл: `client/src/types/common.ts`

- `Author` — общий автор для модулей и диаграмм.
- `User` — текущий пользователь, расширяет `Author`, содержит `isPremium`.
- `RatingAggregate` — агрегат рейтинга `{ sum, count }`.
- `RatingsStore` — локальная форма рейтингов пользователя и агрегатов.

### Module

Файл: `client/src/types/module.ts`

Ключевой тип: `Module`.

Основные поля:

- `id`, `title`, `description`
- `previewWords`, `wordCount`
- `category`, optional `track`
- `progress`
- `type: "text" | "interactive"`
- `folderId`
- `author`
- `visibility: "public" | "private"`
- `sourceModuleId` — ссылка на оригинал для копии в библиотеке
- `favoriteCount`, `rating`
- `lastReviewedAt`, `updatedAt`

Backend должен разделить как минимум две проекции:

- `ModuleSummary` для карточек/каталогов.
- `ModuleDetail` для страницы модуля вместе с карточками.

Рекомендуемая семантика:

- Канонический публичный модуль хранит контент и метаданные автора.
- Пользовательская копия хранит `sourceModuleId`, владельца и индивидуальный прогресс/SRS.
- `progress` лучше считать из карточек/SRS, а не хранить как ручное поле, если backend будет авторитетен по review-событиям.

### Flashcard and SRS

Файлы:

- `client/src/types/flashcard.ts`
- `client/src/types/srs.ts`

`Flashcard`:

- `id`
- `term`
- `definition`
- optional `srs`
- optional `sourceRef`

`CardSrsData` хранит FSRS-состояние v2:

- `due`
- `stability`
- `difficulty`
- `scheduledDays`
- `reps`
- `lapses`
- `state`
- `lastReview`
- `learningSteps`

Backend должен решить, кто авторитетен по SRS:

- клиент присылает готовый FSRS snapshot;
- или backend принимает review event и сам пересчитывает FSRS.

Для надежности лучше хранить review-события и вычисляемый snapshot.

### Diagram

Файл: `client/src/types/diagram.ts`

`Diagram`:

- `id`
- `sourceDiagramId`
- `ownerId`
- `title`, `description`
- `author`
- `subject`
- `accent`, `accentSoft`
- `updatedAt`
- `imageDataUrl` сейчас, в backend лучше `imageUrl`
- `markers`
- `reviewMode: "label-recall" | "zone-pick"`

`DiagramMarker`:

- `id`
- `type: "point" | "zone"`
- `label`
- `hint`
- `x`, `y`
- `points` для polygon-zone
- optional `color`

### Library

Файл: `client/src/types/library.ts`

`LibraryFolder` сейчас содержит:

- `id`
- `name`
- `description`
- `moduleCount`
- `color`

Папки пока mock-only. Backend должен добавить ownership, порядок сортировки и операции перемещения модулей.

### Exam plan

Файл: `client/src/types/examPlan.ts`

`ExamPlan` хранит:

- `examDate`
- `moduleIds`
- `createdAt`
- `goalTitle`
- `targetReadinessPercent`
- `dailyReviews`
- `dailyNewCards`
- `isMock`
- `schemaVersion`
- `userConfirmed`

`ExamPlanSchedule`, `ExamPlanForecast`, `PlanDayEntry`, `ReadinessPoint` сейчас вычисляются на клиенте. Backend может либо отдавать только сохраненный план, либо также иметь preview/forecast endpoint.

### AI generation

Файл: `client/src/types/aiGeneration.ts`

Типы:

- `AiGenerationInput`
- `GeneratedCard`
- `SourceReference`
- `GenerationQuota`

Нужны решения по streaming, лимитам, file/url processing, reset period квоты и premium-лимитам.

## LocalStorage keys

Центральный список: `client/src/services/storageKeys.ts`.

Ключи:

- `flashcards:cards:{moduleId}`
- `flashcards:exam-plan`
- `flashcards:user-modules`
- `flashcards:user-diagrams`
- `flashcards:module-favorites`
- `flashcards:diagram-favorites`
- `flashcards:module-ratings`
- `flashcards:diagram-ratings`
- `flashcards:ai-generation-quota`
- `flashcards-daily-review`

Дополнительно используются:

- `flashcards-module-activity:{moduleId}` в `client/src/lib/moduleStudyActivity.ts`
- `sidebarCollapsed` в Redux UI slice
- `mnemo:breadcrumb-trail` в `sessionStorage`

## Необходимые endpoints

Ниже приведен REST-вариант. GraphQL тоже подойдет, но frontend сейчас ближе к resource-based API.

### Auth and current user

```http
GET /api/users/me
POST /api/auth/oauth/{provider}
POST /api/auth/logout
GET /api/users/me/subscription
```

`GET /api/users/me` должен возвращать `User`.

Subscription response должен включать tier/free-premium и лимиты, которые влияют на premium study modes и AI quota.

### Modules catalog

```http
GET /api/modules/recent
GET /api/modules/global
GET /api/modules/search?q=
GET /api/modules/{moduleId}
```

`GET /api/modules/{moduleId}` должен возвращать detail:

```ts
interface ModuleDetailResponse {
  module: Module
  flashcards: Flashcard[]
}
```

Для каталогов нужна summary-проекция, чтобы не гонять все карточки.

### User module library

```http
GET /api/users/me/modules
POST /api/modules
PATCH /api/modules/{moduleId}
DELETE /api/modules/{moduleId}
POST /api/modules/{moduleId}/copy
PATCH /api/modules/{moduleId}/folder
PATCH /api/modules/{moduleId}/visibility
```

Copy response должен возвращать пользовательскую копию с `sourceModuleId`.

Правило доступа:

- автор может редактировать канонический модуль;
- пользовательская linked copy должна иметь отдельный прогресс;
- контент linked copy лучше сделать read-only, если продукт не поддерживает fork.

### Library folders

```http
GET /api/users/me/folders
POST /api/folders
PATCH /api/folders/{folderId}
DELETE /api/folders/{folderId}
```

Нужны поля ownership, сортировки и счетчики. `moduleCount` лучше отдавать как вычисляемое поле.

### Flashcards and SRS

```http
GET /api/modules/{moduleId}/cards
POST /api/modules/{moduleId}/cards
PUT /api/modules/{moduleId}/cards
PATCH /api/modules/{moduleId}/cards/{cardId}
DELETE /api/modules/{moduleId}/cards
POST /api/modules/{moduleId}/cards/import
POST /api/modules/{moduleId}/reviews
```

`POST /api/modules/{moduleId}/reviews`:

```ts
interface ReviewRequest {
  cardId: string
  rating: SrsRating
  reviewedAt?: string
}
```

Response может вернуть updated `Flashcard`, updated module stats и daily counters.

### Favorites

```http
GET /api/users/me/favorites/modules
PUT /api/users/me/favorites/modules/{moduleId}
DELETE /api/users/me/favorites/modules/{moduleId}
GET /api/users/me/favorites/diagrams
PUT /api/users/me/favorites/diagrams/{diagramId}
DELETE /api/users/me/favorites/diagrams/{diagramId}
```

Вместо toggle endpoint лучше использовать идемпотентные `PUT`/`DELETE`. Frontend может обернуть их в toggle на клиенте.

### Ratings

```http
GET /api/users/me/ratings/modules
PUT /api/modules/{moduleId}/rating
DELETE /api/modules/{moduleId}/rating
GET /api/users/me/ratings/diagrams
PUT /api/diagrams/{diagramId}/rating
DELETE /api/diagrams/{diagramId}/rating
```

Rating request:

```ts
interface RatingRequest {
  rating: 1 | 2 | 3 | 4 | 5
}
```

Rating response:

```ts
interface RatingResponse {
  userRating: number
  averageRating: number
  ratingCount: number
}
```

Backend должен хранить user rating отдельно от агрегата и пересчитывать среднее.

### Diagrams

```http
GET /api/diagrams
GET /api/diagrams/{diagramId}
GET /api/users/me/diagrams
POST /api/diagrams
PATCH /api/diagrams/{diagramId}
DELETE /api/diagrams/{diagramId}
POST /api/diagrams/{diagramId}/copy
```

Для создания диаграммы лучше использовать multipart upload:

```http
POST /api/diagrams
Content-Type: multipart/form-data
```

Поля:

- `title`
- `description`
- `subject`
- `image`
- `markers` as JSON

Response должен вернуть `Diagram`, но с `imageUrl` вместо base64.

### Diagram review

Сейчас review диаграмм session-only и не сохраняет прогресс. Если нужен прогресс:

```http
POST /api/diagrams/{diagramId}/review-sessions
POST /api/diagrams/{diagramId}/review-sessions/{sessionId}/answers
GET /api/diagrams/{diagramId}/progress
```

Для v1 можно оставить без persisted progress.

### Exam plan

```http
GET /api/users/me/exam-plan
PUT /api/users/me/exam-plan
DELETE /api/users/me/exam-plan
POST /api/users/me/exam-plan/preview
```

`PUT` сохраняет `ExamPlan`. `preview` может принимать настройки плана и возвращать `ExamPlanSchedule`.

Backend должен решить, где считается forecast:

- client-side: backend хранит только `ExamPlan`;
- server-side: backend принимает cards/SRS state и возвращает forecast/schedule.

### Study activity and stats

```http
GET /api/users/me/study/daily?date=YYYY-MM-DD
GET /api/users/me/study/summary
GET /api/modules/{moduleId}/activity
```

Лучше хранить review events, а daily/module aggregates считать или материализовать на backend.

### AI generation

```http
GET /api/users/me/ai-quota
POST /api/ai/generate-cards
POST /api/modules/from-generated-cards
```

`POST /api/ai/generate-cards` request:

```ts
interface GenerateCardsRequest {
  text?: string
  url?: string
  fileId?: string
}
```

Response может быть обычным JSON или stream/SSE. Если нужен stream, событие card должно соответствовать `GeneratedCard`.

Нужно определить:

- лимит для free/premium;
- период сброса квоты;
- поддерживаемые file types;
- кто скачивает URL;
- как хранится `sourceRef`;
- какие ошибки возвращаются при quota exceeded, bad URL, unsupported file, empty source.

### Notifications

```http
GET /api/notifications
POST /api/notifications/read-all
PATCH /api/notifications/{notificationId}
```

Пока UI использует статичный список.

## Рекомендации по backend-модели

Минимальные таблицы/коллекции:

- `users`
- `subscriptions`
- `modules`
- `module_instances` or `module_copies`
- `flashcards`
- `card_srs_states`
- `review_events`
- `library_folders`
- `favorites`
- `ratings`
- `diagrams`
- `diagram_markers`
- `exam_plans`
- `ai_generation_jobs`
- `ai_quota_usage`

Важные инварианты:

- Все user-specific данные должны быть scoped by `userId`.
- `sourceModuleId` и `sourceDiagramId` должны ссылаться на канонический ресурс.
- Рейтинги и favorites должны быть уникальны на пару `(userId, resourceType, resourceId)`.
- Review events должны быть append-only, а SRS snapshot можно обновлять транзакционно.
- Uploaded diagram images не должны храниться как base64 в основной таблице.

## Открытые продуктовые решения

- Можно ли редактировать контент linked copy или это только read-only копия?
- `progress` хранится в module row или считается из SRS?
- Диаграммы должны иметь SRS/progress или только session review?
- Экзаменационный план должен учитывать диаграммы или только карточки?
- Нужны ли публичные/private диаграммы так же, как modules visibility?
- Global collections сервер формирует сам или frontend строит их из `/modules/global`?
- AI generation должна быть sync JSON, SSE stream или job-based async?
- Период AI-квоты: daily, monthly или rolling window?
- Какие OAuth providers реально поддерживаются?
- Нужны ли classes/profile/settings в v1 backend, если routes пока placeholder?

## Приоритет backend v1

1. Auth/session и `GET /users/me`.
2. Modules catalog + user library + copy-to-library.
3. Flashcards + review events + SRS state.
4. Favorites/ratings with real aggregates.
5. Exam plan persistence.
6. Diagrams CRUD with upload + markers + copy-to-library.
7. AI generation + quota.
8. Folders, notifications, subscription/billing, classes/profile/settings.
