import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "./src/locale/{locale}/messages",
      include: ["./src"],
    },
  ],
  compileNamespace: "es",
})
