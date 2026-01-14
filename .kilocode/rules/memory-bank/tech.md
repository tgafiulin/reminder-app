# Tech

## 1. Основной стек

- **Язык**: TypeScript [ES-модульный проект, `type: "module"` в package.json].
- **Фреймворк UI**: React 19 + ReactDOM.
- **Сборка и дев‑сервер**: Vite 7.
- **UI‑библиотека компонентов**: Mantine Core + Mantine Hooks + Mantine Styles.
- **Тестирование**:
  - Unit / component tests: Vitest + Testing Library (React, user-event, jest-dom) + jsdom.
  - E2E: Playwright.
- **Линтинг и форматирование**:
  - ESLint 9 + @eslint/js, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh.
  - Prettier 3.
- **PWA**:
  - vite-plugin-pwa с Workbox для кэширования ресурсов.
  - Базовый путь `/reminder-app/` для GitHub Pages.

## 2. Структура проекта

- Клиентское SPA в директории `src/`:
  - Корневой компонент [`App.tsx`](src/App.tsx).
  - Точка входа [`main.tsx`](src/main.tsx).
  - Глобальные стили [`App.css`](src/App.css), [`index.css`](src/index.css).
  - Доменная фича `reminders` в [`src/features/reminders`](src/features/reminders):
    - Типы: [`types.ts`](src/features/reminders/types.ts).
    - UI страницы: [`RemindersPage.tsx`](src/features/reminders/RemindersPage.tsx), [`RemindersPage.css`](src/features/reminders/RemindersPage.css).
    - UI модального окна: [`ContextsModal.tsx`](src/features/reminders/ContextsModal.tsx).
    - Хранилище: [`api/storage.ts`](src/features/reminders/api/storage.ts).
    - Доменные хуки: [`hooks/useReminderScheduler.ts`](src/features/reminders/hooks/useReminderScheduler.ts).
    - Утилиты времени: [`lib/time.ts`](src/features/reminders/lib/time.ts).
    - Утилиты уведомлений: [`lib/notification.ts`](src/features/reminders/lib/notification.ts).
- Тестовая инфраструктура:
  - Юнит-тесты по тем же путям, что и код, с суффиксом `.test.ts(x)`.
  - Общий тестовый сетап [`src/tests/setup.ts`](src/tests/setup.ts).
  - Вспомогательный тестовый рендерер [`src/test-utils.tsx`](src/test-utils.tsx).
  - E2E-спеки в `e2e/` и конфигурация [`playwright.config.ts`](playwright.config.ts).
- Конфигурация TypeScript:
  - [`tsconfig.json`](tsconfig.json) с references на:
    - `tsconfig.app.json` — настройка для приложения.
    - `tsconfig.node.json` — для node‑скриптов, тестов и конфигов.
- Конфигурация Vite:
  - [`vite.config.ts`](vite.config.ts) с React‑плагином `@vitejs/plugin-react` и PWA-плагином `vite-plugin-pwa`.
- CI/CD:
  - GitHub Actions workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) для деплоя на GitHub Pages.

## 3. Хранение данных и интеграции

- **Локальное хранилище**:
  - Браузерный `localStorage` под ключом `remindy:reminders` для напоминаний.
  - Браузерный `localStorage` под ключом `remindy:contexts` для контекстов.
  - Доступ инкапсулирован модулем [`storage.ts`](src/features/reminders/api/storage.ts).
- **Сторонние сервисы**:
  - На текущем этапе отсутствуют.
  - Архитектура предполагает возможность замены `localStorage` на внешний API без изменений в UI.
- **Браузерные уведомления**:
  - Используется стандартный Web Notifications API.
  - Инкапсулирован в модуле [`notification.ts`](src/features/reminders/lib/notification.ts).

## 4. Скрипты npm

Определены в [`package.json`](package.json):

- `npm run dev` — запуск Vite dev server.
- `npm run build` — компиляция TypeScript (`tsc -b`) и сборка Vite.
- `npm run preview` — предпросмотр собранного приложения.
- `npm run lint` — запуск ESLint по проекту.
- `npm run test` — запуск Vitest.

## 5. Ограничения и допущения

- Приложение полностью клиентское, без SSR и без backend.
- Нет глобального стейт‑менеджера (Redux, Zustand и т.п.) — используется локальный стейт React.
- Хранение напоминаний:
  - Жизненный цикл данных привязан к браузеру и конкретному устройству.
  - Отсутствует синхронизация между устройствами и пользователями.
- Таймеры напоминаний:
  - Используют `setTimeout` в рамках текущей вкладки браузера.
  - При закрытии вкладки или перезагрузке активные таймеры теряются; при следующем открытии планировщик заново ставит таймеры только для напоминаний в будущем.
- PWA:
  - Сервис-воркер генерируется автоматически через `vite-plugin-pwa`.
  - Кэширование ресурсов настроено через Workbox.

## 6. Планируемые технологические направления

- **PWA**:
  - Расширение офлайн-режима.
  - Поддержка установки на домашний экран.
  - Кэширование данных для работы без сети.
- **Backend / API**:
  - Подключение внешнего хранилища (например, Supabase или собственный REST/GraphQL API).
  - Авторизация и мульти‑устройство.
- **SSR / более сложный фронтенд**:
  - Возможный эксперимент с SSR‑стеком (например, Next.js или аналогичный подход).
  - Добавление календарей и таймлайнов поверх текущей доменной модели.
