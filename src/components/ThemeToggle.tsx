import { ActionIcon, Tooltip } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const toggleColorScheme = () => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newScheme);
    localStorage.setItem("colorScheme", newScheme);
  };

  return (
    <Tooltip label={colorScheme === "dark" ? "Светлая тема" : "Тёмная тема"}>
      <ActionIcon
        variant="light"
        size="lg"
        onClick={toggleColorScheme}
        aria-label="Переключить тему"
        style={{
          color: "white",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        }}
        styles={{
          root: {
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.3) !important",
            },
          },
        }}
      >
        {colorScheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}
