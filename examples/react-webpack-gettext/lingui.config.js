import { defineConfig } from "@lingui/cli"
import { formatter } from "@lingui/format-po-gettext"

export default defineConfig({
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["<rootDir>/src"],
      exclude: ["**/node_modules/**"],
    },
  ],
  format: formatter({
    origins: true,
    lineNumbers: true,
    printPlaceholdersInComments: false,
  }),
  compileNamespace: "json",
})
