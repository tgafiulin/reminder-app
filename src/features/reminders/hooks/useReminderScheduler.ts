import { useEffect, useRef } from "react";
import { getDelayUntil } from "../lib/time";
import type { Reminder } from "../types";

type ReminderTriggerHandler = (reminderId: string) => void;

export function useReminderScheduler(reminders: Reminder[], onTrigger: ReminderTriggerHandler) {
  const timeoutIdRef = useRef<number | null>(null);

  useEffect(() => {
    // очистить предыдущий таймер
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // выбрать ближайшее напоминание в будущем только среди активных
    const now = new Date();
    const futureReminders = reminders
      .filter((r) => r.status !== "done")
      .filter((r) => r.remindsAt)
      .map((r) => ({
        reminder: r,
        delay: getDelayUntil(r.remindsAt!, now),
      }))
      .filter((x) => x.delay !== null) as { reminder: Reminder; delay: number }[];

    if (futureReminders.length === 0) return;

    futureReminders.sort((a, b) => a.delay - b.delay);
    const { reminder, delay } = futureReminders[0];

    const id = window.setTimeout(() => {
      onTrigger(reminder.id);
    }, delay);

    timeoutIdRef.current = id;

    return () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [reminders, onTrigger]);
}
