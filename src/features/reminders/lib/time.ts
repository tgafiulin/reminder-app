export function getDelayUntil(remindsAt: string, now: Date = new Date()): number | null {
  const targetTime = new Date(remindsAt).getTime();
  const nowTime = now.getTime();

  if (Number.isNaN(targetTime)) {
    return null; // некорректная дата
  }

  const diff = targetTime - nowTime;
  if (diff <= 0) return null; // в прошлом или прямо сейчас

  return diff; // миллисекунды до события
}

export function isOverdue(remindsAt: string, isDone: boolean, now: Date = new Date()): boolean {
  if (isDone) return false;
  const targetTime = new Date(remindsAt).getTime();
  if (Number.isNaN(targetTime)) return false;
  return targetTime < now.getTime();
}