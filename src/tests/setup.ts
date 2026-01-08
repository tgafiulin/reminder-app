import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// matchMedia мок
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated, но Mantine может звать
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// опционально — если что-то из Mantine требует ResizeObserver / scrollIntoView
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(window as any).ResizeObserver = ResizeObserver;
window.HTMLElement.prototype.scrollIntoView = () => {};
