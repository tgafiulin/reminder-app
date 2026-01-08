/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import { RemindersPage } from "./RemindersPage";
import { REMINDERS_STORAGE_KEY } from "./api/storage";
import userEvent from "@testing-library/user-event";
import { renderWithMantine } from "../../test-utils";

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

    renderWithMantine(<RemindersPage />);

    expect(screen.getByText(/Выполнить тест1/i)).toBeInTheDocument();
    expect(screen.getByText(/Выполнить тест с разными элементами/i)).toBeInTheDocument();
  });

  it("saves new reminder to localStorage after adding", async () => {
    const user = userEvent.setup();

    renderWithMantine(<RemindersPage />);

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

    renderWithMantine(<RemindersPage />);

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

  it("removes reminder from UI and localStorage when delete clicked", async () => {
    const user = userEvent.setup();

    const reminders = [
      { id: "1", title: "Первое напоминание" },
      { id: "2", title: "Второе напоминание" },
    ];

    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    renderWithMantine(<RemindersPage />);

    // оба напоминания изначально в DOM
    expect(screen.getByText("Первое напоминание")).toBeInTheDocument();
    expect(screen.getByText("Второе напоминание")).toBeInTheDocument();

    // жмём "Удалить" у первого
    const deleteButtons = screen.getAllByRole("button", { name: /удалить/i });
    await user.click(deleteButtons[0]);

    // в UI остался только второй
    expect(screen.queryByText("Первое напоминание")).not.toBeInTheDocument();
    expect(screen.getByText("Второе напоминание")).toBeInTheDocument();

    // localStorage обновился
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual([{ id: "2", title: "Второе напоминание" }]);
  });

  afterEach(() => {
    localStorage.clear();
  });
});
