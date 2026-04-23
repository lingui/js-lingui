import {defineConfig} from "@lingui/cli"
import nextConfig from "./next.config.js"

export default defineConfig({
  locales: nextConfig.i18n.locales as string[],
  pseudoLocale: "pseudo",
  sourceLocale: nextConfig.i18n.defaultLocale,
  fallbackLocales: {
    default: "en",
  },
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src/"],
    },
  ],
})
