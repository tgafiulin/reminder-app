export type ReminderId = string;

export type ReminderStatus = "active" | "done";

export type Reminder = {
  id: ReminderId;
  title: string;
  description?: string;
  mediaUrl?: string;
  remindsAt?: string;
  status: ReminderStatus;
  context?: string;
};
