import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["pseudo"],
  pseudoLocale: "pseudo",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
  format: "po",
})
