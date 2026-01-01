import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadReminders, saveReminders, REMINDERS_STORAGE_KEY } from "./storage";

describe("reminders storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty array when nothing in storage", () => {
    const reminders = loadReminders();

    expect(reminders).toEqual([]);
  });

  it("loads reminders from valid JSON", () => {
    const reminders = [
      { id: "1", title: "Выполнить тест" },
      { id: "2", title: "Выполнить тест с разными элементами" },
    ];
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    expect(loadReminders()).toEqual(reminders);
  });

  it("returns empty array for invalid JSON", () => {
    localStorage.setItem(REMINDERS_STORAGE_KEY, "not-json");

    expect(loadReminders()).toEqual([]);
  });

  it("saves reminders as JSON string", () => {
    const reminders = [
      { id: "1", title: "Выполнить тест" },
      { id: "2", title: "Выполнить тест с разными элементами" },
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
