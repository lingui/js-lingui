import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en"],
  macro: {
    corePackage: ["@myapp/core/macro"],
    jsxPackage: ["@myapp/jsx/macro"],
  },
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
})
