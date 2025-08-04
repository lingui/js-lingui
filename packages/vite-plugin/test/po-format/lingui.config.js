import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en"],
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
  fallbackLocales: {
    default: "en",
  },
  format: "po",
})
