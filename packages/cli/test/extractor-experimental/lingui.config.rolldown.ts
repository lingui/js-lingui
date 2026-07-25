import { defineConfig } from "@lingui/conf"
import { createRolldownBundler } from "../../src/extract-experimental/bundlers/rolldown.js"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",

  catalogs: [],
  experimental: {
    extractor: {
      entries: ["<rootDir>/fixtures/pages/**/*.page.{ts,tsx}"],
      output: "<rootDir>/actual/{entryName}.{locale}",
      bundler: createRolldownBundler(),
    },
  },
})
