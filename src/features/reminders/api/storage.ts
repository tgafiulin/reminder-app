export const REMINDERS_STORAGE_KEY = "remindy:reminders";
export const CONTEXTS_STORAGE_KEY = "remindy:contexts";

import type { Reminder, Context, ContextId } from "../types";

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
export function loadContexts(): Context[] {
  const contextsJSON = localStorage.getItem(CONTEXTS_STORAGE_KEY);
  if (!contextsJSON) return [];

  try {
    const parsed = JSON.parse(contextsJSON);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Context =>
        typeof c === "object" &&
        c !== null &&
        typeof c.id === "string" &&
        typeof c.name === "string" &&
        c.name.trim().length > 0
    );
  } catch {
    return [];
  }
}

export function saveContexts(contexts: Context[]): void {
  try {
    const json = JSON.stringify(contexts);
    localStorage.setItem(CONTEXTS_STORAGE_KEY, json);
  } catch (e) {
    console.error(e);
  }
}

export function addContext(name: string): ContextId {
  const contexts = loadContexts();
  const trimmed = name.trim();
  if (trimmed.length > 0) {
    const id = `context_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newContext: Context = { id, name: trimmed };
    contexts.push(newContext);
    saveContexts(contexts);
    return id;
  }
  return "";
}

export function removeContext(contextId: ContextId): void {
  const contexts = loadContexts();
  const filtered = contexts.filter((c) => c.id !== contextId);
  saveContexts(filtered);
}

export function updateContext(contextId: ContextId, newName: string): void {
  const contexts = loadContexts();
  const context = contexts.find((c) => c.id === contextId);
  if (context) {
    const trimmed = newName.trim();
    if (trimmed.length > 0) {
      context.name = trimmed;
      saveContexts(contexts);
    }
  }
}

export function getContextById(contextId: ContextId): Context | undefined {
  const contexts = loadContexts();
  return contexts.find((c) => c.id === contextId);
}
