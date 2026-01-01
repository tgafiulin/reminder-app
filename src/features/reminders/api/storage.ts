export const REMINDERS_STORAGE_KEY = "remindy:reminders";

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
