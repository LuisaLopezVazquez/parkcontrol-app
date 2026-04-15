import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest + coverage v8 (lcov) para integración con SonarQube.
 * Ajusta `coverage.include` si Sonar debe analizar más archivos fuente.
 */
export default defineConfig({
  plugins: [react(), tsconfigPaths({ projects: ["./tsconfig.json"] })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    css: true,
    include: ["src/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      include: ["src/routes/vehicles.tsx"],
      exclude: [
        "**/*.spec.*",
        "**/routeTree.gen.ts",
        "**/__root.tsx",
        "**/test-setup.ts",
      ],
    },
  },
});
