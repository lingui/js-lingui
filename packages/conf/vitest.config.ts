import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    env: {
      // force picocolor to output in tests
      FORCE_COLOR: "1",
    },
    globals: true,
  },
})
