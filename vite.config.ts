import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  
  return {
    base: isDev ? "/" : "/reminder-app/",
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        // Включаем PWA в режиме разработки
        devOptions: {
          enabled: true,
          type: "module",
        },
        includeAssets: ["vite.svg"],
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
              },
            },
          ],
        },
        manifest: {
          name: "Remindy",
          short_name: "Remindy",
          description: "Персональное приложение для напоминаний",
          theme_color: "#228be6",
          background_color: "#ffffff",
          display: "standalone",
          start_url: isDev ? "/" : "/reminder-app/",
          icons: [
            {
              src: "vite.svg",
              sizes: "192x192",
              type: "image/svg+xml",
            },
            {
              src: "vite.svg",
              sizes: "512x512",
              type: "image/svg+xml",
            },
          ],
        },
      }),
    ],
  };
});
