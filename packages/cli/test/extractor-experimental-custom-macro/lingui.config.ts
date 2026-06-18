import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en"],
  sourceLocale: "en",

  catalogs: [],
  macro: {
    // The macros are imported through the local `#macros` barrel rather than
    // directly from `@lingui/*/macro`, so the barrel must be declared here.
    corePackage: ["@lingui/core/macro", "#macros"],
    jsxPackage: ["@lingui/react/macro", "#macros"],
  },
  experimental: {
    extractor: {
      entries: ["<rootDir>/fixtures/pages/**/*.page.{ts,tsx}"],
      output: "<rootDir>/actual/{entryName}.{locale}",
    },
  },
})
