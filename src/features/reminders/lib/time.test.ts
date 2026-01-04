import { describe, it, expect } from "vitest";
import { getDelayUntil } from "./time";

describe("getDelayUntil", () => {
  it("возвращает null для прошлого времени", () => {
    const now = new Date("2026-01-02T15:00:00.000Z");
    const past = "2026-01-02T14:59:00.000Z";

    expect(getDelayUntil(past, now)).toBeNull();
  });

  it("возвращает миллисекунды для будущего времени", () => {
    const now = new Date("2026-01-02T15:00:00.000Z");
    const future = "2026-01-02T15:05:00.000Z";

    const delay = getDelayUntil(future, now);

    expect(delay).toBe(5 * 60 * 1000);
  });

  it("возвращает null для некорректной даты", () => {
    const now = new Date("2026-01-02T15:00:00.000Z");
    expect(getDelayUntil("not-a-date", now)).toBeNull();
  });
});
