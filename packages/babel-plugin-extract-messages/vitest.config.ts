import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    env: {
      BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA: "true",
    },
    globals: true,
  },
})
