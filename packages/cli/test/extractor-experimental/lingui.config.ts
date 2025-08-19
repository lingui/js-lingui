import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",
  format: "po",
  catalogs: [],
  experimental: {
    multiThread: true,
    extractor: {
      entries: ["<rootDir>/fixtures/pages/**/*.page.{ts,tsx}"],
      output: "<rootDir>/actual/{entryName}.{locale}",
    },
  },
})
