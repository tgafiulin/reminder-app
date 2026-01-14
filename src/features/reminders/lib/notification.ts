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
    // Получаем регистрацию service worker
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return;
    }

    // Создаем уведомление через Service Worker
    await registration.showNotification(options.title, {
      body: options.body,
      tag: options.tag,
      requireInteraction: true, // Уведомление не исчезнет автоматически
      icon: options.icon,
    });
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
