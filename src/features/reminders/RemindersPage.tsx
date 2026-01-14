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
  Title,
  Modal,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useMantineColorScheme } from "@mantine/core";
import {
  IconSettings,
  IconPlus,
  IconCalendar,
  IconTag,
  IconNote,
  IconClock,
  IconEdit,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";
import type { Reminder } from "./types";

import "./RemindersPage.css";
import { loadReminders, saveReminders, getAllContexts } from "./api/storage";
import { useReminderScheduler } from "./hooks/useReminderScheduler";
import { ContextsModal } from "./ContextsModal";

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
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [contextsList, setContextsList] = useState<string[]>([]);
  const isSmallScreen = useMediaQuery("(max-width: 480px)");
  const { colorScheme } = useMantineColorScheme();

  useReminderScheduler(reminders);

  useEffect(() => {
    setContextsList(getAllContexts(reminders));
  }, [reminders]);

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
    setFormModalOpened(false);
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
      const key = reminder.context?.trim() || "";
      const existing = map.get(key);
      if (existing) {
        existing.push(reminder);
      } else {
        map.set(key, [reminder]);
      }
      return map;
    }, new Map())
  ).sort(([a], [b]) => {
    // Группы без контекста (пустая строка) идут первыми
    if (a === "") return -1;
    if (b === "") return 1;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });

  return (
    <div
      className="reminders-page"
      style={{
        background:
          colorScheme === "dark"
            ? "linear-gradient(135deg, #1a1b1e 0%, #25262b 100%)"
            : "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
      }}
    >
      <div className="reminders-page__container">
        <div className="reminders-page__right">
          <Group justify="space-between" align="center" mb="md" wrap="wrap">
            <Title order={2} fw={700}>
              Мои напоминания
            </Title>
            <Button
              className="reminders-page__header-button"
              onClick={() => setFormModalOpened(true)}
              leftSection={<IconPlus size={18} />}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              size="md"
            >
              Добавить
            </Button>
          </Group>
          <Stack gap="lg" mt="sm">
            {groupedReminders.map(([groupName, groupReminders]) => (
              <div key={groupName || "__no_context__"} className="reminders-group">
                {groupName && (
                  <Group gap={8} mb="md" className="reminders-group__header">
                    <IconTag size={18} color="var(--mantine-color-blue-6)" />
                    <Text fw={600} size="md">
                      {groupName}
                    </Text>
                  </Group>
                )}
                <Stack gap="md">
                  {groupReminders.map((reminder) => {
                    const isEditing = editingId === reminder.id;
                    const isDone = reminder.status === "done";
                    const remindsAtDate = reminder.remindsAt ? new Date(reminder.remindsAt) : null;
                    const isOverdue =
                      remindsAtDate && !isDone && remindsAtDate.getTime() < Date.now();

                    return (
                      <Card
                        key={reminder.id}
                        className={`reminder-card ${isDone ? "reminder-card--done" : ""} ${isOverdue ? "reminder-card--overdue" : ""}`}
                        radius="lg"
                        padding="md"
                        withBorder
                        shadow="sm"
                        style={{
                          transition: "all 0.2s ease",
                          background: isDone
                            ? colorScheme === "dark"
                              ? "linear-gradient(135deg, #2c2e33 0%, #25262b 100%)"
                              : "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
                            : colorScheme === "dark"
                              ? "linear-gradient(135deg, #25262b 0%, #1a1b1e 100%)"
                              : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                          borderColor: isOverdue
                            ? "var(--mantine-color-red-3)"
                            : isDone
                              ? colorScheme === "dark"
                                ? "var(--mantine-color-gray-7)"
                                : "var(--mantine-color-gray-3)"
                              : colorScheme === "dark"
                                ? "var(--mantine-color-gray-8)"
                                : "var(--mantine-color-gray-2)",
                        }}
                      >
                        {isEditing ? (
                          <Stack gap="md">
                            <TextInput
                              label="Заголовок"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.currentTarget.value)}
                              leftSection={<IconNote size={18} />}
                            />
                            <Group gap="xs" align="flex-end">
                              <Autocomplete
                                label="Контекст / тема"
                                value={editingContext}
                                onChange={setEditingContext}
                                data={contextsList}
                                style={{ flex: 1 }}
                                leftSection={<IconTag size={18} />}
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
                              leftSection={<IconCalendar size={18} />}
                            />
                            <Group justify="flex-end" mt="xs">
                              <Button variant="subtle" size="sm" onClick={handleCancelEdit}>
                                Отмена
                              </Button>
                              <Button size="sm" onClick={() => handleSaveEdit(reminder.id)}>
                                Сохранить
                              </Button>
                            </Group>
                          </Stack>
                        ) : (
                          <Stack gap="sm">
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                              <Group gap="md" align="flex-start" style={{ flex: 1 }} wrap="nowrap">
                                <Checkbox
                                  size="md"
                                  checked={isDone}
                                  onChange={() => handleToggleStatus(reminder.id)}
                                  aria-label={
                                    isDone ? "Отметить как активное" : "Отметить как выполненное"
                                  }
                                  styles={{
                                    input: {
                                      cursor: "pointer",
                                    },
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Group gap="xs" align="center" mb={4} wrap="nowrap">
                                    <Text
                                      fw={600}
                                      size="md"
                                      c={isOverdue ? "red" : undefined}
                                      style={{
                                        textDecoration: isDone ? "line-through" : "none",
                                        opacity: isDone ? 0.6 : 1,
                                      }}
                                    >
                                      {reminder.title}
                                    </Text>
                                    {isDone && (
                                      <Badge
                                        color="gray"
                                        size="sm"
                                        variant="light"
                                        leftSection={<IconCheck size={12} />}
                                      >
                                        Выполнено
                                      </Badge>
                                    )}
                                    {isOverdue && !isDone && (
                                      <Badge color="red" size="sm" variant="light">
                                        Просрочено
                                      </Badge>
                                    )}
                                  </Group>
                                  {remindsAtDate && (
                                    <Group gap={6} align="center">
                                      <IconClock
                                        size={14}
                                        color={isOverdue ? "var(--mantine-color-red-6)" : undefined}
                                      />
                                      <Text
                                        size="sm"
                                        c={isOverdue ? "red" : "dimmed"}
                                        fw={isOverdue ? 500 : 400}
                                      >
                                        {remindsAtDate.toLocaleString("ru-RU", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </Text>
                                    </Group>
                                  )}
                                </div>
                              </Group>
                              <Group gap={4} wrap="nowrap">
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  size="lg"
                                  onClick={() => handleStartEdit(reminder)}
                                  title="Редактировать"
                                >
                                  <IconEdit size={18} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="lg"
                                  onClick={() => handleDeleteReminder(reminder.id)}
                                  title="Удалить"
                                >
                                  <IconTrash size={18} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          </Stack>
                        )}
                      </Card>
                    );
                  })}
                </Stack>
              </div>
            ))}
            {groupedReminders.length === 0 && (
              <Card radius="lg" padding="xl" style={{ textAlign: "center" }}>
                <Stack gap="md" align="center">
                  <IconNote size={48} style={{ opacity: 0.5 }} />
                  <Text c="dimmed" size="lg">
                    Пока нет напоминаний
                  </Text>
                  <Text c="dimmed" size="sm">
                    Нажмите кнопку ниже, чтобы создать первое напоминание
                  </Text>
                  <Button
                    onClick={() => setFormModalOpened(true)}
                    leftSection={<IconPlus size={18} />}
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan", deg: 90 }}
                    mt="md"
                  >
                    Создать напоминание
                  </Button>
                </Stack>
              </Card>
            )}
          </Stack>
        </div>
      </div>

      {/* Floating Action Button */}
      {isSmallScreen ? (
        <Button
          className="reminders-page__fab"
          onClick={() => setFormModalOpened(true)}
          size="xl"
          radius="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(34, 139, 230, 0.4)",
            width: 56,
            height: 56,
            minWidth: 56,
            maxWidth: 56,
            padding: 0,
            borderRadius: "50%",
          }}
          styles={{
            root: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            inner: {
              display: "flex !important",
              alignItems: "center !important",
              justifyContent: "center !important",
              width: "100% !important",
              height: "100% !important",
            },
          }}
        >
          <IconPlus size={24} style={{ display: "block" }} />
        </Button>
      ) : (
        <Button
          className="reminders-page__fab"
          onClick={() => setFormModalOpened(true)}
          size="xl"
          radius="xl"
          variant="gradient"
          gradient={{ from: "blue", to: "cyan", deg: 90 }}
          leftSection={<IconPlus size={24} />}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(34, 139, 230, 0.4)",
          }}
        >
          Новое напоминание
        </Button>
      )}

      {/* Модальное окно с формой создания напоминания */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          setFormModalOpened(false);
          setTitle("");
          setRemindsAt("");
          setContext("");
        }}
        title="Новое напоминание"
        size="md"
        centered
        zIndex={10000}
        overlayProps={{ opacity: 0.55, blur: 3 }}
      >
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

          <Group gap="xs" align="flex-end" wrap="nowrap">
            <Autocomplete
              label="Контекст / тема"
              placeholder="Например: Поездка в Стамбул"
              value={context}
              onChange={setContext}
              data={contextsList}
              leftSection={<IconTag size={18} />}
              size="md"
              style={{ flex: 1, minWidth: 0 }}
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
              onClick={() => {
                setContextsModalOpened(true);
              }}
              title="Управление контекстами"
              style={{ marginBottom: 4, flexShrink: 0 }}
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

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setFormModalOpened(false);
                setTitle("");
                setRemindsAt("");
                setContext("");
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={addNewReminder}
              leftSection={<IconPlus size={18} />}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              disabled={!title.trim()}
            >
              Создать
            </Button>
          </Group>
        </Stack>
      </Modal>

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
