export type ReminderId = string;

export type Reminder = {
  id: ReminderId;
  title: string;
  description?: string;
  mediaUrl?: string;
  remindsAt?: string;
};
