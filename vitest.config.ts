import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "scripts/**",
        "**/*.config.*",
        "**/generated/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
