# Context

## 1. Текущий фокус работ

- Базовое SPA Remindy на React + Vite + TypeScript реализовано с одной доменной фичей `reminders`.
- Основные пользовательские сценарии (создание, просмотр, редактирование, удаление напоминаний, сохранение в localStorage и планировщик по времени) уже работают.
- Для фичи `reminders` есть выделенные слои:
  - UI страница [`RemindersPage.tsx`](src/features/reminders/RemindersPage.tsx);
  - хранилище [`storage.ts`](src/features/reminders/api/storage.ts);
  - доменный хук планировщика [`useReminderScheduler.ts`](src/features/reminders/hooks/useReminderScheduler.ts);
  - утилита работы со временем [`time.ts`](src/features/reminders/lib/time.ts).

## 2. Недавние изменения

- Инициализирован Memory Bank в `.kilocode/rules/memory-bank`:
  - обновлен базовый обзор продукта в [`brief.md`](.kilocode/rules/memory-bank/brief.md);
  - описаны цели и UX-поведение в [`product.md`](.kilocode/rules/memory-bank/product.md);
  - зафиксирована архитектура и структура проекта в [`architecture.md`](.kilocode/rules/memory-bank/architecture.md);
  - описан технический стек и инфраструктура в [`tech.md`](.kilocode/rules/memory-bank/tech.md).

## 3. Ближайшие шаги по развитию

- Расширять доменную модель и UI вокруг напоминаний (статусы, приоритеты, группировка по темам/поездкам).
- Готовить архитектуру к появлению дополнительных представлений (календарь, таймлайн) на основе существующего доменного слоя.
- Прорабатывать PWA-аспекты: офлайн-режим, установка на домашний экран, кэширование.
- Планировать интеграцию с внешним хранилищем (backend или BaaS) без ломки текущего UI.

## 4. Как использовать Memory Bank

- Перед началом каждой задачи читать:
  - [`brief.md`](.kilocode/rules/memory-bank/brief.md) для понимания общей цели;
  - [`product.md`](.kilocode/rules/memory-bank/product.md) для проверки продуктового поведения;
  - [`architecture.md`](.kilocode/rules/memory-bank/architecture.md) для навигации по коду;
  - [`tech.md`](.kilocode/rules/memory-bank/tech.md) для учета ограничений и стека;
  - этот файл [`context.md`](.kilocode/rules/memory-bank/context.md) для текущего состояния и приоритетов.
- Обновлять `context.md` после значимых изменений (новые фичи, смена стека, изменение архитектурных подходов).
