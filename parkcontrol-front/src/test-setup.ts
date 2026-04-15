import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

/** TanStack Router (scroll restoration) llama `scrollTo`; jsdom no lo implementa y puede fallar tests. */
window.scrollTo = vi.fn() as typeof window.scrollTo;

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});
