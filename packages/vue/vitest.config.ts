import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { linguiTemplateTransform } from "./src/compiler"

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          nodeTransforms: [linguiTemplateTransform()],
        },
      },
    }),
    vueJsx(),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
  },
})
