import { useState, useMemo } from "react";
import { Modal, Stack, TextInput, Button, Group, Text, ActionIcon, Divider } from "@mantine/core";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { loadContexts, addContext, removeContext, updateContext } from "./api/storage";
import type { Reminder } from "./types";

interface ContextsModalProps {
  opened: boolean;
  onClose: () => void;
  reminders: Reminder[];
  onContextUpdate: () => void;
  onContextRenamed?: (oldContext: string, newContext: string) => void;
  onContextDeleted?: (context: string) => void;
}

export function ContextsModal({
  opened,
  onClose,
  reminders,
  onContextUpdate,
  onContextRenamed,
  onContextDeleted,
}: ContextsModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [newContext, setNewContext] = useState("");

  const contexts = useMemo(() => {
    if (!opened) return [];
    const savedContexts = loadContexts();
    const reminderContexts = reminders
      .map((r) => r.context?.trim())
      .filter((c): c is string => c !== undefined && c.length > 0);

    return Array.from(new Set([...savedContexts, ...reminderContexts])).sort();
  }, [opened, reminders]);

  const handleAddContext = () => {
    const trimmed = newContext.trim();
    if (trimmed.length > 0) {
      addContext(trimmed);
      setNewContext("");
      onContextUpdate();
    }
  };

  const handleStartEdit = (context: string) => {
    setEditingId(context);
    setEditingValue(context);
  };

  const handleSaveEdit = () => {
    if (editingId && editingValue.trim().length > 0) {
      const newContextValue = editingValue.trim();
      if (editingId !== newContextValue) {
        updateContext(editingId, newContextValue);
        onContextRenamed?.(editingId, newContextValue);
      }
      setEditingId(null);
      setEditingValue("");
      onContextUpdate();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const handleDeleteContext = (context: string) => {
    removeContext(context);
    onContextDeleted?.(context);
    onContextUpdate();
  };

  const handleClose = () => {
    setEditingId(null);
    setEditingValue("");
    setNewContext("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Управление контекстами"
      size="md"
      centered
      zIndex={10000}
      overlayProps={{ opacity: 0.55, blur: 3 }}
    >
      <Stack gap="md">
        <div>
          <Text size="sm" mb="xs" fw={500}>
            Создать новый контекст
          </Text>
          <Group gap="xs">
            <TextInput
              placeholder="Название контекста"
              value={newContext}
              onChange={(e) => setNewContext(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddContext();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button onClick={handleAddContext} leftSection={<IconPlus size={16} />}>
              Добавить
            </Button>
          </Group>
        </div>

        <Divider />

        <div>
          <Text size="sm" mb="xs" fw={500}>
            Существующие контексты
          </Text>
          {contexts.length === 0 ? (
            <Text size="sm" c="dimmed">
              Нет сохраненных контекстов
            </Text>
          ) : (
            <Stack gap="xs">
              {contexts.map((context) => (
                <Group key={context} justify="space-between" gap="xs">
                  {editingId === context ? (
                    <>
                      <TextInput
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.currentTarget.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit();
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                      <Group gap={4}>
                        <ActionIcon color="green" variant="light" onClick={handleSaveEdit}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon color="gray" variant="light" onClick={handleCancelEdit}>
                          ✕
                        </ActionIcon>
                      </Group>
                    </>
                  ) : (
                    <>
                      <Text style={{ flex: 1 }}>{context}</Text>
                      <Group gap={4}>
                        <ActionIcon
                          color="blue"
                          variant="light"
                          onClick={() => handleStartEdit(context)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDeleteContext(context)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </>
                  )}
                </Group>
              ))}
            </Stack>
          )}
        </div>
      </Stack>
    </Modal>
  );
}
