import { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Stack,
  Group,
  Card,
  Text,
  Checkbox,
  Badge,
  Autocomplete,
  ActionIcon,
  Divider,
  Title,
  Alert,
} from "@mantine/core";
import {
  IconSettings,
  IconPlus,
  IconCalendar,
  IconTag,
  IconNote,
  IconBell,
} from "@tabler/icons-react";
import type { Reminder } from "./types";

import "./RemindersPage.css";
import { loadReminders, saveReminders, getAllContexts } from "./api/storage";
import { useReminderScheduler } from "./hooks/useReminderScheduler";
import { ContextsModal } from "./ContextsModal";
import { requestNotificationPermission, getNotificationPermission } from "./lib/notification";

export function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const fromStorage = loadReminders();
    // для старых записей без status считаем их активными
    return fromStorage.length > 0
      ? fromStorage.map((r) => ({
          ...r,
          status: r.status ?? "active",
        }))
      : [];
  });
  const [title, setTitle] = useState("");
  const [remindsAt, setRemindsAt] = useState("");
  const [context, setContext] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingRemindsAt, setEditingRemindsAt] = useState("");
  const [editingContext, setEditingContext] = useState("");
  const [contextsModalOpened, setContextsModalOpened] = useState(false);
  const [contextsList, setContextsList] = useState<string[]>([]);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [dismissedPermissionBanner, setDismissedPermissionBanner] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);

  useReminderScheduler(reminders);

  useEffect(() => {
    setContextsList(getAllContexts(reminders));
  }, [reminders]);

  // Проверяем разрешение на уведомления при загрузке
  useEffect(() => {
    const permission = getNotificationPermission();
    setNotificationPermission(permission);
    // Показываем баннер, если API поддерживается, уведомления не включены и пользователь не скрыл баннер
    if ("Notification" in window && permission !== "granted" && !dismissedPermissionBanner) {
      setShowPermissionBanner(true);
    } else {
      setShowPermissionBanner(false);
    }
  }, [dismissedPermissionBanner]);

  // Сохраняем состояние скрытия баннера в localStorage
  useEffect(() => {
    if (dismissedPermissionBanner) {
      localStorage.setItem("remindy:dismissedNotificationBanner", "true");
    }
  }, [dismissedPermissionBanner]);

  // Восстанавливаем состояние скрытия баннера при загрузке
  useEffect(() => {
    const dismissed = localStorage.getItem("remindy:dismissedNotificationBanner");
    if (dismissed === "true") {
      setDismissedPermissionBanner(true);
    }
  }, []);

  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission !== "granted") {
      console.warn("Разрешение на уведомления не получено");
    }
    // Скрываем баннер, если разрешение получено
    if (permission === "granted") {
      setShowPermissionBanner(false);
    }
  };

  const handleDismissBanner = () => {
    setDismissedPermissionBanner(true);
    setShowPermissionBanner(false);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: r.status === "done" ? "active" : "done",
            }
          : r
      )
    );
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
      remindsAt: remindsAtIso,
      status: "active",
      context: context.trim() || undefined,
    };

    const updatedRemiders = [...reminders, newReminder];

    setReminders(updatedRemiders);
    setTitle("");
    setRemindsAt("");
    setContext("");
  };

  const handleStartEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditingTitle(reminder.title);
    setEditingContext(reminder.context ?? "");
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
              remindsAt: remindsAtIso,
              context: editingContext.trim() || undefined,
            }
          : r
      )
    );
    setEditingId(null);
  };

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  // Группировка напоминаний по контексту
  const groupedReminders = Array.from(
    reminders.reduce<Map<string, Reminder[]>>((map, reminder) => {
      const key = reminder.context?.trim() || "Без контекста";
      const existing = map.get(key);
      if (existing) {
        existing.push(reminder);
      } else {
        map.set(key, [reminder]);
      }
      return map;
    }, new Map())
  ).sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  return (
    <div className="reminders-page">
      <div className="reminders-page__container">
        <Card
          shadow="lg"
          radius="lg"
          padding="xl"
          w={380}
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            border: "1px solid #e9ecef",
          }}
        >
          <Stack gap="lg">
            <div>
              <Title order={3} fw={700} mb={4} c="dark.8">
                Новое напоминание
              </Title>
              <Text size="sm" c="dimmed">
                Создайте новое напоминание для важных дел
              </Text>
            </div>

            <Divider />

            <Stack gap="md">
              <TextInput
                label="Заголовок"
                placeholder="Введите заголовок напоминания"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                leftSection={<IconNote size={18} />}
                size="md"
                required
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: 8,
                  },
                }}
              />

              <Group gap="xs" align="flex-end">
                <Autocomplete
                  label="Контекст / тема"
                  placeholder="Например: Поездка в Стамбул"
                  value={context}
                  onChange={setContext}
                  data={contextsList}
                  leftSection={<IconTag size={18} />}
                  size="md"
                  style={{ flex: 1 }}
                  styles={{
                    label: {
                      fontWeight: 600,
                      marginBottom: 8,
                    },
                  }}
                />
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="lg"
                  onClick={() => setContextsModalOpened(true)}
                  title="Управление контекстами"
                  style={{ marginBottom: 4 }}
                >
                  <IconSettings size={20} />
                </ActionIcon>
              </Group>

              <TextInput
                label="Когда напомнить"
                type="datetime-local"
                value={remindsAt}
                onChange={(e) => setRemindsAt(e.currentTarget.value)}
                leftSection={<IconCalendar size={18} />}
                size="md"
                styles={{
                  label: {
                    fontWeight: 600,
                    marginBottom: 8,
                  },
                }}
              />
            </Stack>

            <Divider />

            <Button
              onClick={addNewReminder}
              size="md"
              leftSection={<IconPlus size={18} />}
              fullWidth
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              disabled={!title.trim()}
              style={{
                fontWeight: 600,
                height: 44,
              }}
            >
              Создать напоминание
            </Button>
          </Stack>
        </Card>
        <div className="reminders-page__right">
          {showPermissionBanner && (
            <Alert
              variant="light"
              color={notificationPermission === "denied" ? "orange" : "blue"}
              title={
                notificationPermission === "denied"
                  ? "Уведомления отключены"
                  : "Включите уведомления"
              }
              icon={<IconBell size={20} />}
              mb="md"
            >
              <Text size="sm" mb="xs">
                {notificationPermission === "denied"
                  ? "Вы отклонили разрешение на уведомления. Чтобы включить их, зайдите в настройки сайта в браузере."
                  : "Разрешите уведомления, чтобы получать напоминания о важных событиях."}
              </Text>
              <Group gap="xs">
                {notificationPermission !== "denied" && (
                  <Button size="xs" onClick={handleRequestNotificationPermission}>
                    Разрешить уведомления
                  </Button>
                )}
                <Button size="xs" variant="subtle" onClick={handleDismissBanner}>
                  Больше не показывать
                </Button>
              </Group>
            </Alert>
          )}
          <Text fw={600} mb="xs">
            Мои напоминания
          </Text>
          <Stack gap="xs" mt="sm">
            {groupedReminders.map(([groupName, groupReminders]) => (
              <div key={groupName}>
                <Text fw={500} size="sm" mb={4}>
                  {groupName}
                </Text>
                <Stack gap="xs">
                  {groupReminders.map((reminder) => {
                    const isEditing = editingId === reminder.id;
                    const isDone = reminder.status === "done";

                    return (
                      <Card key={reminder.id} radius="md" withBorder shadow="xs">
                        {isEditing ? (
                          <Stack gap={4}>
                            <TextInput
                              label="Заголовок"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.currentTarget.value)}
                            />
                            <Group gap="xs" align="flex-end">
                              <Autocomplete
                                label="Контекст / тема"
                                value={editingContext}
                                onChange={setEditingContext}
                                data={contextsList}
                                style={{ flex: 1 }}
                              />
                              <ActionIcon
                                variant="light"
                                onClick={() => setContextsModalOpened(true)}
                                title="Управление контекстами"
                              >
                                <IconSettings size={18} />
                              </ActionIcon>
                            </Group>
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
                            <Group justify="space-between" mb={4} align="flex-start">
                              <Group gap={8}>
                                <Checkbox
                                  size="sm"
                                  checked={isDone}
                                  onChange={() => handleToggleStatus(reminder.id)}
                                  aria-label={
                                    isDone ? "Отметить как активное" : "Отметить как выполненное"
                                  }
                                />
                                <div>
                                  <Group gap={8}>
                                    <Text
                                      fw={600}
                                      style={
                                        isDone
                                          ? {
                                              textDecoration: "line-through",
                                              opacity: 0.7,
                                            }
                                          : undefined
                                      }
                                    >
                                      {reminder.title}
                                    </Text>
                                    {isDone && (
                                      <Badge color="gray" size="xs" variant="light">
                                        Выполнено
                                      </Badge>
                                    )}
                                  </Group>
                                  {reminder.remindsAt && (
                                    <Text size="xs" c="dimmed">
                                      Напомнить: {new Date(reminder.remindsAt).toLocaleString()}
                                    </Text>
                                  )}
                                </div>
                              </Group>
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
                          </>
                        )}
                      </Card>
                    );
                  })}
                </Stack>
              </div>
            ))}
          </Stack>
        </div>
      </div>
      <ContextsModal
        opened={contextsModalOpened}
        onClose={() => setContextsModalOpened(false)}
        reminders={reminders}
        onContextUpdate={() => {
          setContextsList(getAllContexts(reminders));
        }}
        onContextRenamed={(oldContext, newContext) => {
          setReminders((prev) =>
            prev.map((r) => (r.context?.trim() === oldContext ? { ...r, context: newContext } : r))
          );
        }}
        onContextDeleted={(deletedContext) => {
          setReminders((prev) =>
            prev.map((r) =>
              r.context?.trim() === deletedContext ? { ...r, context: undefined } : r
            )
          );
        }}
      />
    </div>
  );
}
