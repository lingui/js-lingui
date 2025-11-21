import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    snapshotSerializers: ["../../scripts/jest/stripAnsiSerializer.js"],
    setupFiles: [".vitest/setup.ts"],
    globals: true,
  },
})
