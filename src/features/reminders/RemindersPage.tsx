import { useEffect, useState } from "react";
import {
  TextInput,
  Textarea,
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
  Select,
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
  IconSearch,
} from "@tabler/icons-react";
import type { Reminder } from "./types";

import "./RemindersPage.css";
import {
  loadReminders,
  saveReminders,
  loadContexts,
  addContext,
  getContextById,
} from "./api/storage";
import { useReminderScheduler } from "./hooks/useReminderScheduler";
import { ContextsModal } from "./ContextsModal";
import { isOverdue as isReminderOverdue } from "./lib/time";
import type { ContextId } from "./types";

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
  const [description, setDescription] = useState("");
  const [remindsAt, setRemindsAt] = useState("");
  const [contextName, setContextName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingRemindsAt, setEditingRemindsAt] = useState("");
  const [editingContextName, setEditingContextName] = useState("");
  const [contextsModalOpened, setContextsModalOpened] = useState(false);
  const [formModalOpened, setFormModalOpened] = useState(false);
  const [deleteConfirmOpened, setDeleteConfirmOpened] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [contextsList, setContextsList] = useState<string[]>(() => {
    const contexts = loadContexts();
    return contexts.map((c) => c.name);
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "done" | "overdue">("active");
  const isSmallScreen = useMediaQuery("(max-width: 480px)");
  const isMobileScreen = useMediaQuery("(max-width: 768px)");
  const { colorScheme } = useMantineColorScheme();

  useReminderScheduler(reminders);

  const handleDeleteClick = (id: string) => {
    setReminderToDelete(id);
    setDeleteConfirmOpened(true);
  };

  const handleDeleteConfirm = () => {
    if (reminderToDelete) {
      setReminders(reminders.filter((r) => r.id !== reminderToDelete));
      if (editingId === reminderToDelete) {
        setEditingId(null);
      }
      setDeleteConfirmOpened(false);
      setReminderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpened(false);
    setReminderToDelete(null);
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
    if (!remindsAt.trim()) return; // Дата обязательна

    const date = new Date(remindsAt);
    if (Number.isNaN(date.getTime())) return; // Невалидная дата

    const remindsAtIso = date.toISOString();

    // Найти или создать контекст
    let contextId: ContextId | undefined = undefined;
    if (contextName.trim()) {
      const contexts = loadContexts();
      const existingContext = contexts.find((c) => c.name === contextName.trim());
      if (existingContext) {
        contextId = existingContext.id;
      } else {
        contextId = addContext(contextName.trim());
        const updatedContexts = loadContexts();
        setContextsList(updatedContexts.map((c) => c.name));
      }
    }

    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      remindsAt: remindsAtIso,
      status: "active",
      contextId,
    };

    const updatedRemiders = [...reminders, newReminder];

    setReminders(updatedRemiders);
    setTitle("");
    setDescription("");
    setRemindsAt("");
    setContextName("");
    setFormModalOpened(false);
  };

  const handleStartEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditingTitle(reminder.title);
    setEditingDescription(reminder.description ?? "");
    const contextName = reminder.contextId ? (getContextById(reminder.contextId)?.name ?? "") : "";
    setEditingContextName(contextName);
    const date = new Date(reminder.remindsAt);
    const localISO = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditingRemindsAt(localISO);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim().length === 0) {
      return;
    }
    if (!editingRemindsAt.trim()) {
      return; // Дата обязательна
    }

    const date = new Date(editingRemindsAt);
    if (Number.isNaN(date.getTime())) {
      return; // Невалидная дата
    }

    const remindsAtIso = date.toISOString();

    // Найти или создать контекст
    let contextId: ContextId | undefined = undefined;
    if (editingContextName.trim()) {
      const contexts = loadContexts();
      const existingContext = contexts.find((c) => c.name === editingContextName.trim());
      if (existingContext) {
        contextId = existingContext.id;
      } else {
        contextId = addContext(editingContextName.trim());
        const updatedContexts = loadContexts();
        setContextsList(updatedContexts.map((c) => c.name));
      }
    }

    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              title: editingTitle.trim(),
              description: editingDescription.trim() || undefined,
              remindsAt: remindsAtIso,
              contextId,
            }
          : r
      )
    );
    setEditingId(null);
  };

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  const handleOpenFormModal = () => {
    const contexts = loadContexts();
    setContextsList(contexts.map((c) => c.name));
    setFormModalOpened(true);
  };

  // Фильтрация напоминаний по поисковому запросу и статусу
  const now = new Date();
  const filteredReminders = reminders.filter((reminder) => {
    // Фильтр по поисковому запросу
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const title = reminder.title.toLowerCase();
      if (!title.includes(query)) return false;
    }

    // Фильтр по статусу
    const isDone = reminder.status === "done";
    const reminderIsOverdue = isReminderOverdue(reminder.remindsAt, isDone, now);

    switch (statusFilter) {
      case "all":
        return true;
      case "active":
        return !isDone && !reminderIsOverdue;
      case "done":
        return isDone;
      case "overdue":
        return reminderIsOverdue;
      default:
        return true;
    }
  });

  // Группировка напоминаний по контексту с сортировкой по дате
  const contexts = loadContexts();
  const groupedReminders = Array.from(
    filteredReminders.reduce<Map<ContextId | "", Reminder[]>>((map, reminder) => {
      const key = reminder.contextId || "";
      const existing = map.get(key);
      if (existing) {
        existing.push(reminder);
      } else {
        map.set(key, [reminder]);
      }
      return map;
    }, new Map())
  )
    .map(([contextId, reminders]) => {
      const context = contextId ? contexts.find((c) => c.id === contextId) : undefined;
      const groupName = context?.name || "";
      return [
        groupName,
        [...reminders].sort((a, b) => {
          // Сортировка по дате: ближайшие сначала
          const dateA = new Date(a.remindsAt).getTime();
          const dateB = new Date(b.remindsAt).getTime();
          return dateA - dateB;
        }),
      ] as [string, Reminder[]];
    })
    .sort(([a], [b]) => {
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
              onClick={handleOpenFormModal}
              leftSection={<IconPlus size={18} />}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan", deg: 90 }}
              size="md"
            >
              Добавить
            </Button>
          </Group>
          {isMobileScreen ? (
            <Stack gap="md" mb="md">
              <TextInput
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={18} />}
                size="md"
              />
              <Select
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as "all" | "active" | "done" | "overdue")
                }
                data={[
                  { value: "all", label: "Все" },
                  { value: "active", label: "Активные" },
                  { value: "done", label: "Выполненные" },
                  { value: "overdue", label: "Просроченные" },
                ]}
                size="md"
              />
            </Stack>
          ) : (
            <Group gap="md" mb="md">
              <TextInput
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                leftSection={<IconSearch size={18} />}
                size="md"
                style={{ flex: 1 }}
              />
              <Select
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as "all" | "active" | "done" | "overdue")
                }
                data={[
                  { value: "all", label: "Все" },
                  { value: "active", label: "Активные" },
                  { value: "done", label: "Выполненные" },
                  { value: "overdue", label: "Просроченные" },
                ]}
                size="md"
                style={{ width: 180 }}
              />
            </Group>
          )}
          <Stack gap="md" mt="sm">
            {groupedReminders.map(([groupName, groupReminders]) => (
              <div key={groupName || "__no_context__"} className="reminders-group">
                {groupName && (
                  <Group gap={6} mb="sm" className="reminders-group__header">
                    <IconTag size={16} color="var(--mantine-color-blue-6)" />
                    <Text fw={600} size="sm">
                      {groupName}
                    </Text>
                  </Group>
                )}
                <Stack gap="sm">
                  {groupReminders.map((reminder) => {
                    const isEditing = editingId === reminder.id;
                    const isDone = reminder.status === "done";
                    const remindsAtDate = new Date(reminder.remindsAt);
                    const isOverdue = !isDone && remindsAtDate.getTime() < Date.now();

                    return (
                      <Card
                        key={reminder.id}
                        className={`reminder-card ${isDone ? "reminder-card--done" : ""} ${isOverdue ? "reminder-card--overdue" : ""}`}
                        radius="md"
                        padding="sm"
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
                            <Textarea
                              label="Описание"
                              placeholder="Дополнительная информация (необязательно)"
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.currentTarget.value)}
                              minRows={3}
                              maxRows={6}
                            />
                            <Group gap="xs" align="flex-end">
                              <Autocomplete
                                label="Контекст / тема"
                                value={editingContextName}
                                onChange={setEditingContextName}
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
                              required
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
                          <Stack gap="xs">
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                              <Group gap="sm" align="flex-start" style={{ flex: 1 }} wrap="nowrap">
                                <Checkbox
                                  size="sm"
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
                                  <Group gap="xs" align="center" mb={2} wrap="nowrap">
                                    <Text
                                      fw={600}
                                      size="sm"
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
                                        size="xs"
                                        variant="light"
                                        leftSection={<IconCheck size={10} />}
                                      >
                                        Выполнено
                                      </Badge>
                                    )}
                                    {isOverdue && !isDone && (
                                      <Badge color="red" size="xs" variant="light">
                                        Просрочено
                                      </Badge>
                                    )}
                                  </Group>
                                  {reminder.description && (
                                    <Text
                                      size="xs"
                                      c="dimmed"
                                      style={{
                                        marginTop: 4,
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        lineHeight: 1.4,
                                      }}
                                    >
                                      {reminder.description}
                                    </Text>
                                  )}
                                  {remindsAtDate && (
                                    <Group gap={4} align="center" mt={reminder.description ? 4 : 0}>
                                      <IconClock
                                        size={12}
                                        color={isOverdue ? "var(--mantine-color-red-6)" : undefined}
                                      />
                                      <Text
                                        size="xs"
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
                                  size="md"
                                  onClick={() => handleStartEdit(reminder)}
                                  title="Редактировать"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="md"
                                  onClick={() => handleDeleteClick(reminder.id)}
                                  title="Удалить"
                                >
                                  <IconTrash size={16} />
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
                    onClick={handleOpenFormModal}
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
          onClick={handleOpenFormModal}
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
          onClick={handleOpenFormModal}
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
          setDescription("");
          setRemindsAt("");
          setContextName("");
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

          <Textarea
            label="Описание"
            placeholder="Дополнительная информация (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            size="md"
            minRows={3}
            maxRows={6}
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
              value={contextName}
              onChange={setContextName}
              data={contextsList}
              leftSection={<IconTag size={18} />}
              style={{ flex: 1, minWidth: 0 }}
              comboboxProps={{ zIndex: 10001 }}
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
            required
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
                setDescription("");
                setRemindsAt("");
                setContextName("");
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

      {/* Модальное окно подтверждения удаления */}
      <Modal
        opened={deleteConfirmOpened}
        onClose={handleDeleteCancel}
        title="Удалить напоминание?"
        centered
        zIndex={10000}
        overlayProps={{ opacity: 0.55, blur: 3 }}
      >
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleDeleteCancel}>
            Отмена
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            Удалить
          </Button>
        </Group>
      </Modal>

      <ContextsModal
        opened={contextsModalOpened}
        onClose={() => {
          setContextsModalOpened(false);
          const contexts = loadContexts();
          setContextsList(contexts.map((c) => c.name));
        }}
        onContextUpdate={() => {
          const contexts = loadContexts();
          setContextsList(contexts.map((c) => c.name));
        }}
        onContextDeleted={(deletedContextId) => {
          setReminders((prev) =>
            prev.map((r) => (r.contextId === deletedContextId ? { ...r, contextId: undefined } : r))
          );
        }}
      />
    </div>
  );
}
