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

export default function lingui(linguiConfig: LinguiConfigOpts = {}): Plugin {
  const config = getConfig(linguiConfig)

  return {
    name: "vite-plugin-lingui",

    transform(src, id) {
      if (fileRegex.test(id)) {
        const catalogRelativePath = path.relative(config.rootDir, id)

        const fileCatalog = getCatalogForFile(
          catalogRelativePath,
          getCatalogs(config)
        )

        const { locale, catalog } = fileCatalog

        const messages = catalog.getTranslations(locale, {
          fallbackLocales: config.fallbackLocales,
          sourceLocale: config.sourceLocale,
        })

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
