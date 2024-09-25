import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths({
    root: "./",
  })],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
})
