import { useEffect, useState } from "react";
import { TextInput, Textarea, Button, Stack, Group, Card, Text } from "@mantine/core";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingMediaUrl, setEditingMediaUrl] = useState("");
  const [editingRemindsAt, setEditingRemindsAt] = useState("");

  useReminderScheduler(reminders, (id) => {
    setTriggeredReminderId(id);
  });

  const handleCloseBanner = () => {
    setTriggeredReminderId(null);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

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

  const handleStartEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditingTitle(reminder.title);
    setEditingDescription(reminder.description ?? "");
    setEditingMediaUrl(reminder.mediaUrl ?? "");
    if (reminder.remindsAt) {
      const date = new Date(reminder.remindsAt);
      const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEditingRemindsAt(localISO);
    } else {
      setEditingRemindsAt("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim().length === 0) {
      return;
    }

    let remindsAtIso: string | undefined = undefined;
    if (editingRemindsAt.trim()) {
      const date = new Date(editingRemindsAt);
      if (!Number.isNaN(date.getTime())) {
        remindsAtIso = date.toISOString();
      }
    }

    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              title: editingTitle.trim(),
              description: editingDescription.trim() || undefined,
              mediaUrl: editingMediaUrl.trim() || undefined,
              remindsAt: remindsAtIso,
            }
          : r
      )
    );
    setEditingId(null);
  };

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  return (
    <div className="reminders-page">
      <div className="reminders-page__container">
        <Card shadow="md" radius="md" padding="md" w={340}>
          <Text fw={600} mb="xs">
            Новое напоминание
          </Text>

          <Stack gap="xs">
            <TextInput
              label="Заголовок"
              placeholder="Новое напоминание"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />

            <Textarea
              label="Описание"
              placeholder="Описание (необязательно)"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />

            <TextInput
              label="Ссылка на медиа"
              placeholder="Ссылка на медиа (необязательно)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.currentTarget.value)}
            />

            <TextInput
              label="Когда напомнить"
              type="datetime-local"
              value={remindsAt}
              onChange={(e) => setRemindsAt(e.currentTarget.value)}
            />

            <Group justify="flex-end" mt="sm">
              <Button onClick={addNewReminder}>Добавить</Button>
            </Group>
          </Stack>
        </Card>
        <div className="reminders-page__right">
          <Text fw={600} mb="xs">
            Мои напоминания
          </Text>
          {triggeredReminderId && (
            <Card
              padding="xs"
              radius="md"
              withBorder
              style={{ borderColor: "#22c55e", background: "#ecfdf3" }}
            >
              <Group justify="space-between">
                <Text size="sm" c="green.9">
                  Напоминание сработало
                </Text>
                <Button variant="subtle" size="xs" color="green" onClick={handleCloseBanner}>
                  OK
                </Button>
              </Group>
            </Card>
          )}
          <Stack gap="xs" mt="sm">
            {reminders.map((reminder) => {
              const isTriggered = triggeredReminderId === reminder.id;
              const isEditing = editingId === reminder.id;

              return (
                <Card
                  key={reminder.id}
                  radius="md"
                  withBorder
                  shadow="xs"
                  style={
                    isTriggered
                      ? { borderColor: "#22c55e", boxShadow: "0 0 0 1px rgba(34,197,94,0.25)" }
                      : undefined
                  }
                >
                  {isEditing ? (
                    <Stack gap={4}>
                      <TextInput
                        label="Заголовок"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.currentTarget.value)}
                      />
                      <Textarea
                        label="Описание"
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.currentTarget.value)}
                      />
                      <TextInput
                        label="Ссылка на медиа"
                        value={editingMediaUrl}
                        onChange={(e) => setEditingMediaUrl(e.currentTarget.value)}
                      />
                      <TextInput
                        label="Когда напомнить"
                        type="datetime-local"
                        value={editingRemindsAt}
                        onChange={(e) => setEditingRemindsAt(e.currentTarget.value)}
                      />
                      <Group justify="flex-end" mt={4}>
                        <Button variant="subtle" size="xs" onClick={handleCancelEdit}>
                          Отмена
                        </Button>
                        <Button size="xs" onClick={() => handleSaveEdit(reminder.id)}>
                          Сохранить
                        </Button>
                      </Group>
                    </Stack>
                  ) : (
                    <>
                      <Group justify="space-between" mb={4}>
                        <Text fw={600}>{reminder.title}</Text>
                        <Group gap={4}>
                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => handleStartEdit(reminder)}
                          >
                            Редактировать
                          </Button>
                          <Button
                            variant="subtle"
                            size="xs"
                            color="red"
                            onClick={() => handleDeleteReminder(reminder.id)}
                          >
                            Удалить
                          </Button>
                        </Group>
                      </Group>

                      {reminder.remindsAt && (
                        <Text size="xs" c="dimmed">
                          Напомнить: {new Date(reminder.remindsAt).toLocaleString()}
                        </Text>
                      )}

                      {reminder.description && (
                        <Text size="sm" mt={4}>
                          {reminder.description}
                        </Text>
                      )}

                      {reminder.mediaUrl && (
                        <Text
                          component="a"
                          href={reminder.mediaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          mt={4}
                        >
                          Открыть медиа
                        </Text>
                      )}

                      {isTriggered && (
                        <Text size="xs" mt={4} c="green.9" fw={500}>
                          Напоминание сработало
                        </Text>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </Stack>
        </div>
      </div>
    </div>
  );
}
