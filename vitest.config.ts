import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@acme/shared": fileURLToPath(
        new URL("./packages/shared/src/index.ts", import.meta.url),
      ),
      "~": fileURLToPath(new URL("./apps/web/src", import.meta.url)),
    },
  },
  test: {
    clearMocks: true,
    environment: "jsdom",
  },
});
