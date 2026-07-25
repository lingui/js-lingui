import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    env: {
      // force picocolor to output in tests
      FORCE_COLOR: "1",
    },
    globals: true,
  },
})
