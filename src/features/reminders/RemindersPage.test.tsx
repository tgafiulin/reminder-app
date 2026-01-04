import { render, screen } from "@testing-library/react";
import { RemindersPage } from "./RemindersPage";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { REMINDERS_STORAGE_KEY } from "./api/storage";
import userEvent from "@testing-library/user-event";

describe("reminders storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders initial reminders", () => {
    const reminders = [
      { id: "1", title: "Выполнить тест1" },
      { id: "2", title: "Выполнить тест с разными элементами" },
    ];

    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    render(<RemindersPage />);

    expect(screen.getByText(/Выполнить тест1/i)).toBeInTheDocument();
    expect(screen.getByText(/Выполнить тест с разными элементами/i)).toBeInTheDocument();
  });

  it("saves new reminder to localStorage after adding", async () => {
    const user = userEvent.setup();

    render(<RemindersPage />);

    const input = screen.getByPlaceholderText(/Новое напоминание/i);
    const button = screen.getByRole("button", { name: /добавить/i });

    const title = "Проверка сохранения в localStorage";

    await user.type(input, title);
    await user.click(button);

    // в UI появился новый элемент
    expect(screen.getByText("Проверка сохранения в localStorage")).toBeInTheDocument();

    // данные записались в localStorage
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual([
      { id: expect.any(String), title }, // id генерируется, поэтому матчим по any(String)
    ]);
  });

  it("renders description and media link when provide", async () => {
    const user = userEvent.setup();

    render(<RemindersPage />);

    const input = screen.getByPlaceholderText(/Новое напоминание/i);
    const textarea = screen.getByPlaceholderText(/Описание/i);
    const urlInput = screen.getByPlaceholderText(/Ссылка на медиа/i);
    const button = screen.getByRole("button", { name: /добавить/i });

    const title = "Проверка сохранения в localStorage";
    const description = "Необязательное описание";
    const url = "http://localhost:5173/";

    await user.type(input, title);
    await user.type(textarea, description);
    await user.type(urlInput, url);
    await user.click(button);

    // в UI появился новый элемент
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();

    const mediaLink = screen.getByRole("link", { name: /открыть медиа/i });
    expect(mediaLink).toHaveAttribute("href", url);
  });

  afterEach(() => {
    localStorage.clear();
  });
});
