import { useEffect, useState } from "react";
import type { Reminder } from "./types";

import "./RemindersPage.css";
import { loadReminders, saveReminders } from "./api/storage";
import { useReminderScheduler } from "./hooks/useReminderScheduler";

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const fromStorage = loadReminders();
    return fromStorage.length > 0 ? fromStorage : [];
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [remindsAt, setRemindsAt] = useState("");
  const [triggeredReminderId, setTriggeredReminderId] = useState<string | null>(null);

  useReminderScheduler(reminders, (id) => {
    setTriggeredReminderId(id);
  });

  const addNewReminder = () => {
    if (title.trim().length === 0) return;
    let remindsAtIso: string | undefined = undefined;
    if (remindsAt.trim()) {
      const date = new Date(remindsAt);
      if (!Number.isNaN(date.getTime())) {
        remindsAtIso = date.toISOString();
      }
    }

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      mediaUrl: mediaUrl.trim() || undefined,
      remindsAt: remindsAtIso,
    };

    const updatedRemiders = [...reminders, newReminder];

    setReminders(updatedRemiders);
    setTitle("");
    setMediaUrl("");
    setDescription("");
    setRemindsAt("");
  };

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  return (
    <div className="reminders-page">
      <div className="reminders-page__container">
        <section className="reminders-page__form">
          <h2 className="reminders-page__form-title">Новое напоминание</h2>
          <div>
            <div className="reminders-page__label">Заголовок</div>
            <input
              type="text"
              placeholder="Новое напоминание"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="reminders-page__input"
            />
          </div>
          <div>
            <div className="reminders-page__label">Описание</div>
            <textarea
              className="reminders-page__textarea"
              placeholder="Описание (необязательно)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <div className="reminders-page__label">Ссылка на медиа</div>
            <input
              className="reminders-page__input"
              type="url"
              placeholder="Ссылка на медиа (необязательно)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
          </div>
          <div>
            <div className="reminders-page__label">Когда напомнить</div>
            <input
              className="reminders-page__input"
              type="datetime-local"
              placeholder="Когда напомнить (необязательно)"
              value={remindsAt}
              onChange={(e) => setRemindsAt(e.target.value)}
            />
          </div>
          <button onClick={addNewReminder} className="reminders-page__button">
            Добавить
          </button>
        </section>
        <section className="reminders-page__right">
          <h2 className="reminders-page__list-title">Мои напоминания</h2>
          <div className="reminders-page__list">
            {reminders.map((reminder) => (
              <article key={reminder.id} className="reminders-page__item">
                <div className="reminders-page__item-header">
                  <div className="reminders-page__item-title">{reminder.title}</div>
                  <div className="reminders-page__item-actions">
                    {/* кнопки удалить/отметить и т.п. */}
                  </div>
                </div>

                {reminder.remindsAt && (
                  <div className="reminders-page__reminds-at">
                    Напомнить: {new Date(reminder.remindsAt).toLocaleString()}
                  </div>
                )}

                {reminder.description && (
                  <div className="reminders-page__item-description">{reminder.description}</div>
                )}

                {reminder.mediaUrl && (
                  <a
                    href={reminder.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reminders-page__item-media-link"
                  >
                    Открыть медиа
                  </a>
                )}

                {triggeredReminderId === reminder.id && (
                  <div className="reminders-page__banner">Напоминание сработало!</div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
