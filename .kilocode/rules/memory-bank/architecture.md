# Architecture

## 1. Общая архитектурная модель

Фронтенд-приложение Remindy построено как одностраничное приложение на React + Vite + TypeScript в парадигме **feature-first**:

- Вся доменная логика текущего продукта сосредоточена в фиче **reminders**.
- Для фичи используется слоистое разбиение:
  - `api` — работа с хранилищем (сейчас `localStorage`, в будущем может быть заменен на backend).
  - `hooks` — доменные хуки, инкапсулирующие бизнес-логику (планировщик напоминаний).
  - `lib` — утилиты домена (работа со временем).
  - UI-компоненты страницы — `RemindersPage`.

Верхнеуровневая структура `src`:

```text
src/
  App.tsx
  main.tsx
  App.css
  index.css
  assets/
  features/
    reminders/
      RemindersPage.tsx
      RemindersPage.css
      types.ts
      api/
        storage.ts
      hooks/
        useReminderScheduler.ts
      lib/
        time.ts
  tests/
    setup.ts
  test-utils.tsx
```

## 2. Основные модули и их ответственность

### 2.1. Входная точка приложения

- [`src/main.tsx`](src/main.tsx) — монтирует React-приложение в DOM, подключает глобальные стили.
- [`src/App.tsx`](src/App.tsx) — корневой компонент приложения:
  - отображает заголовок **Remindy**;
  - рендерит страницу напоминаний [`RemindersPage`](src/features/reminders/RemindersPage.tsx).

Уровень роутинга пока отсутствует — по сути одноэкранное SPA.

### 2.2. Домен напоминаний

#### Типы

- [`src/features/reminders/types.ts`](src/features/reminders/types.ts)

Описание доменной сущности `Reminder`:

- `id: string` — уникальный идентификатор;
- `title: string` — заголовок (обязательное поле);
- `description?: string` — текстовое описание;
- `mediaUrl?: string` — ссылка на медиа;
- `remindsAt?: string` — дата/время напоминания в ISO-строке.

Этот файл задает контракт между UI, хранилищем и планировщиком напоминаний.

#### Хранилище

- [`src/features/reminders/api/storage.ts`](src/features/reminders/api/storage.ts)

Ответственность: абстракция над механизмом хранения напоминаний.

- `REMINDERS_STORAGE_KEY = "remindy:reminders"` — ключ в `localStorage`.
- `loadReminders(): Reminder[]`:
  - читает JSON-строку из `localStorage`;
  - безопасно парсит данные:
    - при отсутствии данных возвращает пустой массив;
    - при ошибке `JSON.parse` возвращает пустой массив;
    - при не-массиве тоже возвращает пустой массив.
- `saveReminders(reminders: Reminder[]): void`:
  - сериализует массив напоминаний;
  - сохраняет в `localStorage`;
  - логирует ошибку в консоль при неудаче.

Важно: UI не знает о деталях `localStorage` и взаимодействует только через этот модуль, что упрощает будущую замену на внешний API.

#### Вспомогательная логика времени

- [`src/features/reminders/lib/time.ts`](src/features/reminders/lib/time.ts)

Функция:

- `getDelayUntil(remindsAt: string, now: Date = new Date()): number | null`:
  - преобразует целевое время в миллисекунды;
  - проверяет валидность даты;
  - возвращает:
    - `null`, если дата некорректна;
    - `null`, если целевое время в прошлом или прямо сейчас;
    - положительную разницу в миллисекундах до события.

Этот модуль инкапсулирует логику вычисления задержки до напоминания и используется планировщиком.

#### Планировщик напоминаний

- [`src/features/reminders/hooks/useReminderScheduler.ts`](src/features/reminders/hooks/useReminderScheduler.ts)

Назначение: наблюдать за списком напоминаний и запускать callback, когда наступает время ближайшего будущего напоминания.

Ключевые детали:

- Использует `useRef` для хранения текущего `timeoutId`.
- В `useEffect`:
  - очищает предыдущий таймер при каждом изменении `reminders` или `onTrigger`;
  - фильтрует напоминания с заполненным `remindsAt`;
  - для каждого вычисляет задержку через `getDelayUntil`;
  - отбрасывает `null` (прошлое или некорректное время);
  - сортирует по возрастанию задержки;
  - планирует `setTimeout` на самое ближайшее событие;
  - при срабатывании таймера вызывает `onTrigger(reminder.id)`;
  - в cleanup повторно очищает таймер.

Слой планировщика полностью отделен от UI — он не знает ничего о компонентах и работает только с данными `Reminder` и колбэком.

### 2.3. Страница напоминаний

- [`src/features/reminders/RemindersPage.tsx`](src/features/reminders/RemindersPage.tsx)
- [`src/features/reminders/RemindersPage.css`](src/features/reminders/RemindersPage.css)

Ответственность: реализует весь пользовательский сценарий работы с напоминаниями в одном экране.

Основные элементы состояния:

- `reminders: Reminder[]` — текущий список напоминаний.
  - Инициализируется вызовом `loadReminders()` с защитой от пустых/битых данных.
- Поля формы создания:
  - `title`, `description`, `mediaUrl`, `remindsAt`.
- Поля редактирования:
  - `editingId`, `editingTitle`, `editingDescription`, `editingMediaUrl`, `editingRemindsAt`.
- `triggeredReminderId` — id напоминания, которое только что сработало (для подсветки и баннера).

Ключевая логика:

- Инициализация: при первом рендере читает данные из localStorage через `loadReminders`.
- Подписка на планировщик:
  - `useReminderScheduler(reminders, (id) => setTriggeredReminderId(id))`.
- Сохранение в localStorage:
  - `useEffect` наблюдает за `reminders` и вызывает `saveReminders(reminders)` при каждом изменении.
- Создание напоминания:
  - Валидация: пустой `title` блокирует создание.
  - Обработка `remindsAt`:
    - парсинг введенного значения `datetime-local` в `Date`;
    - проверка валидности;
    - хранение в ISO-формате (`toISOString()`), если валидно.
  - Очищает поля формы после успешного добавления.
- Удаление напоминания:
  - фильтрация по `id`;
  - сброс режима редактирования, если удаляется редактируемый элемент.
- Редактирование:
  - `handleStartEdit`:
    - переносит поля напоминания в `editing*`;
    - для `remindsAt` выполняет преобразование ISO → локальный формат `YYYY-MM-DDTHH:mm`, учитывая `timezoneOffset`.
  - `handleSaveEdit`:
    - валидация `editingTitle`;
    - обработка `editingRemindsAt` аналогично созданию;
    - обновление нужного элемента в массиве.
  - `handleCancelEdit` — сброс `editingId`.

UI-слой:

- Использует компоненты Mantine (`Card`, `TextInput`, `Textarea`, `Stack`, `Group`, `Button`, `Text`).
- Делит экран на два блока:
  - Левая колонка — форма создания напоминания.
  - Правая колонка — список напоминаний, баннер срабатывания и карточки.
- В карточках:
  - режим отображения/редактирования;
  - вывод даты `remindsAt` через `toLocaleString`;
  - опциональный вывод описания и ссылки-на медиаресурс;
  - подсветка сработавшего напоминания (цвет границы, тень, текстовый маркер).

CSS:

- [`RemindersPage.css`](src/features/reminders/RemindersPage.css) отвечает за базовую раскладку страницы и отступы (двухколоночный layout и т.п.).

## 3. Слои и зависимости

### 3.1. Слои

Упрощенная слоистая модель:

- UI:
  - [`App.tsx`](src/App.tsx)
  - [`RemindersPage.tsx`](src/features/reminders/RemindersPage.tsx)
  - CSS-стили и компоненты Mantine.
- Доменная логика:
  - [`useReminderScheduler.ts`](src/features/reminders/hooks/useReminderScheduler.ts)
  - [`time.ts`](src/features/reminders/lib/time.ts)
  - [`types.ts`](src/features/reminders/types.ts)
- Хранилище:
  - [`storage.ts`](src/features/reminders/api/storage.ts)

Направление зависимостей:

- UI зависит от домена и хранилища.
- Доменная логика (`hooks`, `lib`) зависит только от типов и стандартных API.
- Хранилище зависит от типов и браузерного `localStorage`.

### 3.2. Диаграмма потоков

```mermaid
flowchart TD
  subgraph UI
    A[App]
    B[RemindersPage]
  end

  subgraph Domain
    C[types Reminder]
    D[useReminderScheduler]
    E[getDelayUntil]
  end

  subgraph Storage
    F[storage localStorage]
  end

  A --> B
  B --> C
  B --> D
  B --> F
  D --> C
  D --> E
  F --> C
```

## 4. Тесты

Основные тестовые файлы:

- [`src/features/reminders/api/storage.test.ts`](src/features/reminders/api/storage.test.ts)
- [`src/features/reminders/hooks/useReminderScheduler.test.ts`](src/features/reminders/hooks/useReminderScheduler.test.ts)
- [`src/features/reminders/lib/time.test.ts`](src/features/reminders/lib/time.test.ts)
- [`src/features/reminders/RemindersPage.test.tsx`](src/features/reminders/RemindersPage.test.tsx)
- [`src/tests/setup.ts`](src/tests/setup.ts)
- [`src/test-utils.tsx`](src/test-utils.tsx)
- e2e-тесты Playwright:
  - [`e2e/reminders.spec.ts`](e2e/reminders.spec.ts)
  - [`e2e/example.spec.ts`](e2e/example.spec.ts)

Общий подход:

- Юнит-тесты покрывают:
  - вычисление задержки до напоминания;
  - планировщик напоминаний;
  - работу хранилища;
  - поведение страницы напоминаний (через Testing Library и jsdom).
- E2E-тесты проверяют сценарии на уровне браузера (через Playwright).

## 5. Инфраструктура и сборка

- [`vite.config.ts`](vite.config.ts) — минимальная конфигурация Vite:
  - React-плагин `@vitejs/plugin-react`.
- TypeScript:
  - [`tsconfig.json`](tsconfig.json) использует `references` на `tsconfig.app.json` и `tsconfig.node.json`.
- ESLint / Prettier:
  - [`eslint.config.js`](eslint.config.js)
  - [`.prettierrc`](.prettierrc)
  - [`.prettierignore`](.prettierignore)

## 6. Готовность к будущему развитию

Текущая архитектура уже учитывает будущие шаги:

- **Расширение домена**:
  - добавление новых фич возможно через новые директории в `src/features`;
  - фича `reminders` может быть расширена дополнительными представлениями (календарь, таймлайн), которые будут жить как новые компоненты/страницы и переиспользовать существующий доменный слой.
- **Смена хранилища**:
  - логика `localStorage` инкапсулирована в `api/storage.ts`;
  - при подключении backend можно заменить реализацию или добавить новые функции, не ломая UI-код.
- **PWA и офлайн**:
  - Vite и разделение по слоям позволяют относительно просто добавить сервис-воркера и кэширование ресурсов;
  - локальное хранение напоминаний уже реализовано.

Этот файл должен обновляться при:

- добавлении новых фич в `src/features`;
- изменении способа хранения данных;
- появлении новых слоев (например, глобального стейт-менеджмента или отдельного маршрутизатора).
