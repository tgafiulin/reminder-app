export const REMINDERS_STORAGE_KEY = "remindy:reminders";
export const CONTEXTS_STORAGE_KEY = "remindy:contexts";

import type { Reminder } from "../types";

export function loadReminders(): Reminder[] {
  const remindersJSON = localStorage.getItem(REMINDERS_STORAGE_KEY);
  if (!remindersJSON) return [];

  try {
    const parsed = JSON.parse(remindersJSON);
    if (!Array.isArray(parsed)) return [];
    return parsed as Reminder[];
  } catch {
    return [];
  }
}

export function saveReminders(reminders: Reminder[]): void {
  try {
    const json = JSON.stringify(reminders);
    localStorage.setItem(REMINDERS_STORAGE_KEY, json);
  } catch (e) {
    console.error(e);
  }
}

// Функции для работы с контекстами
export function loadContexts(): string[] {
  const contextsJSON = localStorage.getItem(CONTEXTS_STORAGE_KEY);
  if (!contextsJSON) return [];

  try {
    const parsed = JSON.parse(contextsJSON);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === "string" && c.trim().length > 0);
  } catch {
    return [];
  }
}

export function saveContexts(contexts: string[]): void {
  try {
    const uniqueContexts = Array.from(
      new Set(contexts.map((c) => c.trim()).filter((c) => c.length > 0))
    );
    const json = JSON.stringify(uniqueContexts);
    localStorage.setItem(CONTEXTS_STORAGE_KEY, json);
  } catch (e) {
    console.error(e);
  }
}

export function addContext(context: string): void {
  const contexts = loadContexts();
  const trimmed = context.trim();
  if (trimmed.length > 0 && !contexts.includes(trimmed)) {
    contexts.push(trimmed);
    saveContexts(contexts);
  }
}

export function removeContext(context: string): void {
  const contexts = loadContexts();
  const filtered = contexts.filter((c) => c !== context);
  saveContexts(filtered);
}

export function updateContext(oldContext: string, newContext: string): void {
  const contexts = loadContexts();
  const index = contexts.indexOf(oldContext);
  if (index !== -1) {
    const trimmed = newContext.trim();
    if (trimmed.length > 0) {
      contexts[index] = trimmed;
      saveContexts(contexts);
    }
  }
}

// Получить все уникальные контексты из напоминаний и сохраненных контекстов
export function getAllContexts(reminders: Reminder[]): string[] {
  const savedContexts = loadContexts();
  const reminderContexts = reminders
    .map((r) => r.context?.trim())
    .filter((c): c is string => c !== undefined && c.length > 0);

  const allContexts = new Set([...savedContexts, ...reminderContexts]);
  return Array.from(allContexts).sort();
}
