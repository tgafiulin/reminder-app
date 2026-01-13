/// <reference types="vitest/globals" />

import { renderHook } from "@testing-library/react";
import { useReminderScheduler } from "./useReminderScheduler";
import type { Reminder } from "../types";

// Мокаем глобальный Notification API
globalThis.Notification = {
  permission: "granted",
} as unknown as typeof Notification;

// Мокаем модуль уведомлений
vi.mock("../lib/notification", () => ({
  showNotification: vi.fn(),
  canShowNotifications: vi.fn(() => true),
}));

// Импортируем мокнутую функцию после объявления vi.mock
import { showNotification } from "../lib/notification";

describe("useReminderScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T12:00:00.000Z"));
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("вызывает showNotification для ближайшего напоминания", () => {
    const reminders: Reminder[] = [
      { id: "1", title: "без даты", status: "active" },
      {
        id: "2",
        title: "через 5 минут",
        remindsAt: "2026-01-02T12:05:00.000Z",
        status: "active",
      },
      {
        id: "3",
        title: "в прошлом",
        remindsAt: "2026-01-02T11:00:00.000Z",
        status: "active",
      },
    ];

    renderHook(() => useReminderScheduler(reminders));

    // перематываем время на 5 минут
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith({
      title: "через 5 минут",
      body: "Напоминание",
      tag: "2",
    });
  });

  it("не ставит таймер если нет будущих напоминаний", () => {
    const reminders: Reminder[] = [
      { id: "1", title: "без даты", status: "active" },
      {
        id: "2",
        title: "в прошлом",
        remindsAt: "2026-01-02T11:00:00.000Z",
        status: "active",
      },
    ];

    renderHook(() => useReminderScheduler(reminders));

    vi.runAllTimers(); // не должно быть уведомлений
    expect(showNotification).not.toHaveBeenCalled();
  });
});
