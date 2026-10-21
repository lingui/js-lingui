import { defineConfig } from "vite"
import { lingui } from "@lingui/vite-plugin"

export default defineConfig({
  plugins: [lingui({ macroTransform: true })],
})
