import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en-US", "en-GB"],
  sourceLocale: "en-US",
  fallbackLocales: {
    default: "en-US",
  },
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
})
