import { defineConfig } from "@lingui/vue/config"
import { createVueExtractor } from "@lingui/extractor-vue"
import babel from "@lingui/cli/api/extractors/babel"

export default defineConfig({
  locales: ["en", "pl"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
    },
  ],
  extractors: [babel, createVueExtractor()],
})
