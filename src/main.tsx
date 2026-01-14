import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";

// Запрашиваем разрешение на уведомления при загрузке приложения
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Разрешение на уведомления получено");
    } else {
      console.log("Разрешение на уведомления отклонено");
    }
  });
}

// Загружаем сохранённую тему из localStorage
const savedColorScheme = localStorage.getItem("colorScheme") as "light" | "dark" | null;
const defaultColorScheme = savedColorScheme || "light";

const theme = createTheme({
  defaultRadius: "md",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme={defaultColorScheme}>
      <App />
    </MantineProvider>
  </StrictMode>
);
