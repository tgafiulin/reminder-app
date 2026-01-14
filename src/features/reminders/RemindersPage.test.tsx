/// <reference types="vitest/globals" />

import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import { RemindersPage } from "./RemindersPage";
import { REMINDERS_STORAGE_KEY } from "./api/storage";
import userEvent from "@testing-library/user-event";
import { renderWithMantine } from "../../test-utils";

// Мокаем модуль уведомлений
vi.mock("../lib/notification", () => ({
  showNotification: vi.fn(),
  canShowNotifications: vi.fn(() => true),
}));

// Мокаем crypto.randomUUID()
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => "mock-uuid-1234",
  },
});

describe("reminders storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders initial reminders", () => {
    const reminders = [
      { id: "1", title: "Выполнить тест1", status: "active" },
      { id: "2", title: "Выполнить тест с разными элементами", status: "active" },
    ];

    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    renderWithMantine(<RemindersPage />);

    expect(screen.getByText(/Выполнить тест1/i)).toBeInTheDocument();
    expect(screen.getByText(/Выполнить тест с разными элементами/i)).toBeInTheDocument();
  });

  it("saves new reminder to localStorage after adding", async () => {
    const user = userEvent.setup();

    renderWithMantine(<RemindersPage />);

    // Открываем модальное окно
    const addButton = screen.getByRole("button", { name: /добавить/i });
    await user.click(addButton);

    // Заполняем форму
    const input = screen.getByPlaceholderText(/Введите заголовок напоминания/i);
    const title = "Проверка сохранения в localStorage";
    await user.type(input, title);

    // Заполняем дату (обязательное поле)
    const dateInput = screen.getByLabelText(/Когда напомнить/i);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateValue = futureDate.toISOString().slice(0, 16);
    await user.type(dateInput, dateValue);

    // Создаём напоминание (выбираем кнопку "Создать" из модального окна, а не "Создать напоминание" из пустого состояния)
    const createButtons = screen.getAllByRole("button", { name: /создать/i });
    const createButton = createButtons.find((btn) => btn.textContent === "Создать");
    expect(createButton).toBeDefined();
    await user.click(createButton!);

    // в UI появился новый элемент
    expect(screen.getByText("Проверка сохранения в localStorage")).toBeInTheDocument();

    // данные записались в localStorage
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual([
      { id: expect.any(String), title, status: "active", remindsAt: expect.any(String) }, // id генерируется, поэтому матчим по any(String)
    ]);
  });

  it("renders description and media link when provide", async () => {
    const user = userEvent.setup();

    renderWithMantine(<RemindersPage />);

    // Открываем модальное окно
    const addButton = screen.getByRole("button", { name: /добавить/i });
    await user.click(addButton);

    // Заполняем форму
    const input = screen.getByPlaceholderText(/Введите заголовок напоминания/i);
    const title = "Проверка сохранения в localStorage";
    await user.type(input, title);

    const contextInput = screen.getByPlaceholderText(/Например: Поездка в Стамбул/i);
    const context = "Тестовый контекст";
    await user.type(contextInput, context);

    // Заполняем дату (обязательное поле)
    const dateInput = screen.getByLabelText(/Когда напомнить/i);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateValue = futureDate.toISOString().slice(0, 16);
    await user.type(dateInput, dateValue);

    // Создаём напоминание (выбираем кнопку "Создать" из модального окна, а не "Создать напоминание" из пустого состояния)
    const createButtons = screen.getAllByRole("button", { name: /создать/i });
    const createButton = createButtons.find((btn) => btn.textContent === "Создать");
    expect(createButton).toBeDefined();
    await user.click(createButton!);

    // в UI появился новый элемент
    expect(screen.getByText(title)).toBeInTheDocument();
    // Контекст может появляться несколько раз (в списке автозаполнения и в карточке)
    expect(screen.getAllByText(context).length).toBeGreaterThan(0);
  });

  it("removes reminder from UI and localStorage when delete clicked", async () => {
    const user = userEvent.setup();

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const remindsAt = futureDate.toISOString();

    const reminders = [
      { id: "1", title: "Первое напоминание", status: "active", remindsAt },
      { id: "2", title: "Второе напоминание", status: "active", remindsAt },
    ];

    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));

    renderWithMantine(<RemindersPage />);

    // оба напоминания изначально в DOM
    expect(screen.getByText("Первое напоминание")).toBeInTheDocument();
    expect(screen.getByText("Второе напоминание")).toBeInTheDocument();

    // жмём "Удалить" у первого (это ActionIcon с title "Удалить")
    const deleteButtons = screen.getAllByTitle(/удалить/i);
    await user.click(deleteButtons[0]);

    // Подтверждаем удаление в модальном окне (это кнопка Button, а не ActionIcon)
    const confirmDeleteButtons = screen.getAllByRole("button", { name: /удалить/i });
    // ActionIcon кнопки имеют title="Удалить", а кнопка подтверждения - это обычная Button с текстом "Удалить"
    // Находим кнопку, которая не является ActionIcon (у ActionIcon есть специфичные классы или структура)
    const confirmDeleteButton = confirmDeleteButtons.find((btn) => 
      btn.textContent === "Удалить" && !btn.getAttribute("title")
    );
    expect(confirmDeleteButton).toBeDefined();
    await user.click(confirmDeleteButton!);

    // в UI остался только второй
    expect(screen.queryByText("Первое напоминание")).not.toBeInTheDocument();
    expect(screen.getByText("Второе напоминание")).toBeInTheDocument();

    // localStorage обновился
    const stored = localStorage.getItem(REMINDERS_STORAGE_KEY);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored as string);
    expect(parsed).toEqual([{ id: "2", title: "Второе напоминание", status: "active", remindsAt }]);
  });

  afterEach(() => {
    localStorage.clear();
  });
});
