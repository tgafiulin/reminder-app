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
  alert("📱 Шаг 2: Проверка поддержки Notification API");

  if (!("Notification" in window)) {
    alert("❌ Шаг 2.1: Notification API не поддерживается");
    return;
  }

  alert("✅ Шаг 2.2: Notification API поддерживается");

  // Если разрешения нет, пытаемся запросить
  if (Notification.permission !== "granted") {
    alert(`📱 Шаг 3: Текущее разрешение: ${Notification.permission}`);

    const permission = await requestNotificationPermission();

    alert(`📱 Шаг 3.1: Результат запроса разрешения: ${permission}`);

    if (permission !== "granted") {
      alert("❌ Шаг 3.2: Разрешение не получено, уведомление не будет показано");
      return;
    }

    alert("✅ Шаг 3.3: Разрешение получено");
  } else {
    alert("✅ Шаг 3: Разрешение уже есть (granted)");
  }

  try {
    alert("📱 Шаг 4: Создание уведомления...");

    // Создаем уведомление (работает и в браузере, и в PWA)
    const notification = new Notification(options.title, {
      body: options.body,
      tag: options.tag,
      requireInteraction: true, // Уведомление не исчезнет автоматически
    });

    alert("✅ Шаг 4.1: Уведомление создано успешно");

    // При клике на уведомление фокусируем окно
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    alert(`❌ Шаг 4: Ошибка при создании уведомления: ${error}`);
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
