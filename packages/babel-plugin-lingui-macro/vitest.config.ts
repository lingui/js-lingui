import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    snapshotSerializers: ["./.vitest/code-serializer.js"],
    globals: true,
  },
})
