import {defineConfig} from "@lingui/cli"

export default defineConfig({
  locales: ['en', 'sr', 'es', 'pseudo'],
  pseudoLocale: 'pseudo',
  sourceLocale: 'en',
  fallbackLocales: {
    default: 'en'
  },
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['src/']
    }
  ]
})
