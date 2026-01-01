import { useEffect, useState } from "react";
import type { Reminder } from "./types";

import "./RemindersPage.css";
import { loadReminders, saveReminders } from "./api/storage";

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const fromStorage = loadReminders();
    return fromStorage.length > 0 ? fromStorage : [];
  });
  const [title, setTitle] = useState("");

  const addNewReminder = () => {
    if (title.trim().length === 0) return;

    const updatedRemiders = [
      ...reminders,
      {
        id: crypto.randomUUID(),
        title: title,
      },
    ];

    setReminders(updatedRemiders);
    setTitle("");
  };

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  return (
    <div className="reminders-page">
      <h2 className="reminders-page__title">Напоминания</h2>
      <section>
        <div className="reminders-page__form">
          <input
            type="text"
            placeholder="Новое напоминание"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="reminders-page__input"
          />
          <button onClick={addNewReminder} className="reminders-page__button">
            Добавить
          </button>
        </div>
      </section>
      <section>
        <ul className="reminders-page__list">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="reminders-page__item">
              {reminder.title}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
