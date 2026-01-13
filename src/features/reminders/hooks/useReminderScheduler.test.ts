import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReminderScheduler } from "./useReminderScheduler";
import type { Reminder } from "../types";

describe("useReminderScheduler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-02T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("вызывает onTrigger для ближайшего напоминания", () => {
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

    const onTrigger = vi.fn();

    renderHook(() => useReminderScheduler(reminders, onTrigger));

    // перематываем время на 5 минут
    vi.advanceTimersByTime(5 * 60 * 1000);

    expect(onTrigger).toHaveBeenCalledTimes(1);
    expect(onTrigger).toHaveBeenCalledWith("2");
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

    const onTrigger = vi.fn();

    renderHook(() => useReminderScheduler(reminders, onTrigger));

    vi.runAllTimers(); // не должно быть колбеков
    expect(onTrigger).not.toHaveBeenCalled();
  });
});
