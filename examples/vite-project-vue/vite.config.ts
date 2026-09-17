/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { lingui } from "@lingui/vite-plugin"
import { linguiVue } from "@lingui/vue/vite"

export default defineConfig({
  plugins: [
    vue(),
    // compiles Lingui macros in <template> blocks, <script setup> and modules
    linguiVue(),
    // JSX/TSX files: keep vueJsx() after linguiVue()
    vueJsx(),
    // loads .po catalogs
    lingui(),
  ],
  test: {
    environment: "happy-dom",
  },
})
