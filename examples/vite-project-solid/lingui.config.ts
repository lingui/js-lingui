import { defineConfig } from "@lingui/solid/config"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
    },
  ],
})
