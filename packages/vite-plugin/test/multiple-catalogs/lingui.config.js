import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/components/{name}/locale/{locale}",
      include: ["<rootDir>/components/{name}"],
    },
  ],
  experimental: {
    extractor: {
      entries: ["<rootDir>/pages/*.js"],
      output: "<rootDir>/{entryDir}/locales/{entryName}/{locale}",
    },
  },
})
