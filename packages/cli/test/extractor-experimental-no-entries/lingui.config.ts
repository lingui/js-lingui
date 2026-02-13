import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",
  catalogs: [],
  experimental: {
    extractor: {
      entries: ["<rootDir>/fixtures/does-not-exist/**/*.page.{ts,tsx}"],
      output: "<rootDir>/actual/{entryName}.{locale}",
    },
  },
})
