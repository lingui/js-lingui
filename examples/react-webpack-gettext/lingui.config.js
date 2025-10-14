/** @type {import('@lingui/conf').LinguiConfig} */
import { formatter } from "@lingui/format-po-gettext"

const config = {
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
  compileNamespace: "window.i18njs",
}

export default config
