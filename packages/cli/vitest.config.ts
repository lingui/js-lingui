import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    snapshotSerializers: [".vitest/serializer.ts"],
    setupFiles: [".vitest/setup.ts"],
    globals: true,
  },
})
