import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    snapshotSerializers: ["../../scripts/jest/stripAnsiSerializer.js"],
  },
})
