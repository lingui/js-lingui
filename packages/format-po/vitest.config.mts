import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths({
    root: "./",
  })],
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
})
