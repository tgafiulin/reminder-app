import { test, expect } from "@playwright/test";

test("user can add a new reminder", async ({ page }) => {
  // 1. открыть главную страницу
  await page.goto("/"); // baseURL уже настроен в config

  // 2. найти input (по placeholder или роли/label)
  const input = page.getByPlaceholder("Новое напоминание");

  // 3. ввести текст, например "Сходить в спортзал"
  await input.fill("Сходить в спортзал");
  // 4. нажать кнопку "Добавить" (по роли button и имени)
  const button = page.getByText("Добавить");
  await button.click();

  // 5. проверить, что текст появился в списке
  await expect(page.getByText("Сходить в спортзал")).toBeVisible();
});
