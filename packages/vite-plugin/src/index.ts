import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
  getCatalogDependentFiles,
} from "@lingui/cli/api"
import path from "path"
import type { Plugin } from "vite"

const fileRegex = /(\.po|\?lingui)$/

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

    async transform(src, id) {
      if (fileRegex.test(id)) {
        id = id.split("?")[0]

        const catalogRelativePath = path.relative(config.rootDir, id)

        const fileCatalog = getCatalogForFile(
          catalogRelativePath,
          await getCatalogs(config)
        )

        if (!fileCatalog) {
          throw new Error(
            `Requested resource ${catalogRelativePath} is not matched to any of your catalogs paths specified in "lingui.config".

Resource: ${id}

Your catalogs:
${config.catalogs.map((c) => c.path).join("\n")}
Please check that catalogs.path is filled properly.\n`
          )
        }

        const { locale, catalog } = fileCatalog

        getCatalogDependentFiles(catalog, locale).forEach((locale) => {
          this.addWatchFile(catalog.getFilename(locale))
        })

        const messages = await catalog.getTranslations(locale, {
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

export default lingui
