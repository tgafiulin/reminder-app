import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { MantineProvider } from "@mantine/core";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </StrictMode>
);
