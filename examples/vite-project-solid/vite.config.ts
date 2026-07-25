/// <reference types="vitest/config" />
import { defineConfig } from "vite"
import solid from "vite-plugin-solid"
import { lingui } from "@lingui/vite-plugin"

export default defineConfig({
  plugins: [
    solid({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    lingui(),
  ],
  test: {
    environment: "happy-dom",
  },
})
