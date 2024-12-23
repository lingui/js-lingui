import { defineProject } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"
import commonjs from 'vite-plugin-commonjs'

export default defineProject({
  plugins: [commonjs(), tsconfigPaths({ projects: ["../../tsconfig.json"] })],

  test: {
    name: "core",
    environment: "node",
  },
})
