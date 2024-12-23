import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"
import commonjs from "vite-plugin-commonjs"

export default defineConfig({
  plugins: [commonjs(), tsconfigPaths({ projects: ["../../tsconfig.json"] })],
  test: {
    environment: "node",
    server: {
      deps: {
        inline: ["webpack", "loader-runner"],
      },
    },
  },
})
