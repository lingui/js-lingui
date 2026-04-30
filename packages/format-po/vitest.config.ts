import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    env: {
      TZ: "UTC",
    },
    globals: true,
  },
})
