export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

/**
 * Показывает уведомление
 */
export function showNotification(options: NotificationOptions): void {
  if (!("Notification" in window)) {
    console.warn("Notification API не поддерживается");
    return;
  }

  if (Notification.permission !== "granted") {
    console.warn("Нет разрешения на уведомления");
    return;
  }

  // Создаем уведомление
  const notification = new Notification(options.title, {
    body: options.body,
    icon: options.icon || "/reminder-app/vite.svg",
    tag: options.tag,
    requireInteraction: true, // Уведомление не исчезнет автоматически
  });

  // При клике на уведомление фокусируем окно
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/**
 * Проверяет, поддерживаются ли уведомления и есть ли разрешение
 */
export function canShowNotifications(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}
