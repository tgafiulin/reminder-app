import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadReminders, saveReminders, REMINDERS_STORAGE_KEY } from "./storage";
import type { Reminder } from "../types";

describe("reminders storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when nothing in storage", () => {
    const reminders = loadReminders();

    expect(reminders).toEqual([]);
  });

  it("loads reminders from valid JSON", () => {
    const reminders: Reminder[] = [
      { id: "1", title: "Выполнить тест", status: "active" },
      { id: "2", title: "Выполнить тест с разными элементами", status: "active" },
    ];
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    expect(loadReminders()).toEqual(reminders);
  });

  it("returns empty array for invalid JSON", () => {
    localStorage.setItem(REMINDERS_STORAGE_KEY, "not-json");

    expect(loadReminders()).toEqual([]);
  });

  it("saves reminders as JSON string", () => {
    const reminders: Reminder[] = [
      { id: "1", title: "Выполнить тест", status: "active" },
      { id: "2", title: "Выполнить тест с разными элементами", status: "active" },
    ];

    saveReminders(reminders);

    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual(reminders);
  });

  afterEach(() => {
    localStorage.clear();
  });
});
