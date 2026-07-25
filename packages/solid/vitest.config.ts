import { defineConfig } from "vitest/config"
import solid from "vite-plugin-solid"

export default defineConfig({
  plugins: [solid({ hot: false })],
  resolve: {
    conditions: ["browser", "development"],
  },
  test: {
    environment: "happy-dom",
    globals: true,
  },
})
