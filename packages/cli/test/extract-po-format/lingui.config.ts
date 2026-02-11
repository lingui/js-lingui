import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",

  catalogs: [
    {
      path: "<rootDir>/actual/{locale}",
      include: ["<rootDir>/fixtures"],
    },
  ],
})
