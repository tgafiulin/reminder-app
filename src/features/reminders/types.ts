export type ReminderId = string;
export type ContextId = string;

export type ReminderStatus = "active" | "done";

export type Context = {
  id: ContextId;
  name: string;
};

export type Reminder = {
  id: ReminderId;
  title: string;
  description?: string;
  mediaUrl?: string;
  remindsAt: string;
  status: ReminderStatus;
  contextId?: ContextId;
};
