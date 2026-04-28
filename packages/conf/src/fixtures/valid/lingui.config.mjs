import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en", "es"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
      include: ["<rootDir>/src"],
    },
  ],
})
