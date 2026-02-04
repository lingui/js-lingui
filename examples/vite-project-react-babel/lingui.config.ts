import  { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: 'en',
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
    },
  ],
})
