export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

/**
 * Запрашивает разрешение на показ уведомлений
 * @returns Promise с результатом запроса разрешения
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  if (Notification.permission === "denied") {
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "denied";
  }
}

/**
 * Показывает уведомление
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  if (!("Notification" in window)) {
    return;
  }

  // Если разрешения нет, пытаемся запросить
  if (Notification.permission !== "granted") {
    const permission = await requestNotificationPermission();
    if (permission !== "granted") {
      return;
    }
  }

  try {
    // Создаем уведомление (работает и в браузере, и в PWA)
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
  } catch {
    // Ошибка при создании уведомления
  }
}

/**
 * Проверяет, поддерживаются ли уведомления и есть ли разрешение
 */
export function canShowNotifications(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

/**
 * Возвращает текущее состояние разрешения на уведомления
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!("Notification" in window)) {
    return null;
  }
  return Notification.permission;
}
