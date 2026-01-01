import { useState } from "react";
import type { Reminder } from "./types";

import "./RemindersPage.css";

const initialReminders: Reminder[] = [
  { id: "1", title: "Купить молоко" },
  { id: "2", title: "Позвонить другу" },
];

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [title, setTitle] = useState("");

  const addNewReminder = () => {
    if (title.trim().length === 0) return;

    setReminders([
      ...reminders,
      {
        id: crypto.randomUUID(),
        title: title,
      },
    ]);
    setTitle("");
  };

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
