// test-utils.tsx
import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";

export function renderWithMantine(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }: React.PropsWithChildren) => (
      <MantineProvider env="test">{children}</MantineProvider>
    ),
  });
}
