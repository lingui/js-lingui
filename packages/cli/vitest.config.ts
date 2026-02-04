import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    snapshotSerializers: [".vitest/serializer.ts"],
    setupFiles: [".vitest/setup.ts"],
    globals: true,
  },
})
