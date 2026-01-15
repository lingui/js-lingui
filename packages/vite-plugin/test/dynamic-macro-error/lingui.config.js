import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en"],
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}",
    },
  ],
  format: "po",
})
