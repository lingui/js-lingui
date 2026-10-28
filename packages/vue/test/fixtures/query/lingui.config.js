import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}",
      include: ["<rootDir>"],
    },
  ],
  macro: {
    jsxPackage: ["@lingui/vue/macro"],
    jsxRuntime: "vue",
  },
  runtimeConfigModule: {
    Trans: ["@lingui/vue", "Trans"],
    useLingui: ["@lingui/vue", "useLingui"],
  },
})
