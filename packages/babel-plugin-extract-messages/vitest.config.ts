import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    env: {
      BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
    },
    globals: true,
  },
})
