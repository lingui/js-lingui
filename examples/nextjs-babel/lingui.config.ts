import { defineConfig } from "@lingui/cli"
import nextConfig from "./next.config"

// Next.js is the source of truth for the supported locales
const { locales, defaultLocale } = nextConfig.i18n!

export default defineConfig({
  locales: [...locales],
  pseudoLocale: "pseudo",
  sourceLocale: defaultLocale,
  fallbackLocales: {
    default: defaultLocale,
  },
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src/"],
    },
  ],
})
