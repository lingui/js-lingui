import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths({
    root: "./",
  })],
  test: {
    environment: "node",
    snapshotSerializers: ["../../scripts/jest/stripAnsiSerializer.ts"],
    setupFiles: ["./vitest.setup.ts"],
  },
})
