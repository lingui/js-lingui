import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
} from "@lingui/cli/api"
import path from "path"
import type { Plugin } from "vite"

const fileRegex = /\.(po)$/

type LinguiConfigOpts = {
  cwd?: string
  configPath?: string
  skipValidation?: boolean
}

export function lingui(linguiConfig: LinguiConfigOpts = {}): Plugin {
  const config = getConfig(linguiConfig)

  return {
    name: "vite-plugin-lingui",

    config: (config) => {
      // https://github.com/lingui/js-lingui/issues/1464
      config.optimizeDeps.exclude = config.optimizeDeps.exclude || []
      config.optimizeDeps.exclude.push("@lingui/macro")
    },

    transform(src, id) {
      if (fileRegex.test(id)) {
        const catalogRelativePath = path.relative(config.rootDir, id)

        const fileCatalog = getCatalogForFile(
          catalogRelativePath,
          getCatalogs(config)
        )

        const { locale, catalog } = fileCatalog
        const catalogs = catalog.readAll()

        const messages = Object.keys(catalogs[locale]).reduce((acc, key) => {
          acc[key] = catalog.getTranslation(catalogs, locale, key, {
            fallbackLocales: config.fallbackLocales,
            sourceLocale: config.sourceLocale,
          })

          return acc
        }, {})

        const compiled = createCompiledCatalog(locale, messages, {
          strict: false,
          namespace: "es",
          pseudoLocale: config.pseudoLocale,
        })

        return {
          code: compiled,
          map: null, // provide source map if available
        }
      }
    },
  }
}

export default lingui
