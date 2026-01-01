import { render, screen } from "@testing-library/react";
import { RemindersPage } from "./RemindersPage";
import { expect, it } from "vitest";

it("renders initial reminders", () => {
  render(<RemindersPage />);

  // заголовок
  expect(screen.getByRole("heading", { name: /напоминания/i })).toBeInTheDocument();

  // одно из моковых напоминаний
  expect(screen.getByText(/купить молоко/i)).toBeInTheDocument();
});
