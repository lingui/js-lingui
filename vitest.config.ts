import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["packages/**/*.{ts,tsx}"],
      exclude: [
        "**/node_modules/**",
        "**/build/**",
        "**/fixtures/**",
        "**/test/**",
        "**/__typetests__/**",
        "**/*.config.ts",
        "**/*.d.ts",
      ],
    },
    projects: ["packages/*"],
  },
})
