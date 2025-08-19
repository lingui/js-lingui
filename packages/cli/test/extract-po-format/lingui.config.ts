import { defineConfig } from "@lingui/conf"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",
  format: "po",
  catalogs: [
    {
      path: "<rootDir>/actual/{locale}",
      include: ["<rootDir>/fixtures"],
    },
  ],
  experimental: {
    multiThread: true,
  },
})
