import path from "path"
import { CatalogFormat, getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
} from "@lingui/cli/api"

type LinguiConfigOpts = {
  cwd?: string
  configPath?: string
  skipValidation?: boolean
}
type SnowpackLoadOpts = {
  filePath: string
}
export default function compileLinguiMessages(
  snowpackConfig?,
  linguiConfig: LinguiConfigOpts = {}
) {
  const strict = process.env.NODE_ENV !== "production"
  const config = getConfig(linguiConfig)

  return {
    name: "@lingui/snowpack-plugin",
    resolve: {
      input: [".po", ".json"],
      output: [".js"],
    },
    async load({ filePath }: SnowpackLoadOpts) {
      const catalogRelativePath = path.relative(config.rootDir, filePath)
      const EMPTY_EXT = /\.[0-9a-z]+$/.test(filePath)
      const JS_EXT = /\.js+$/.test(filePath)

      if (!EMPTY_EXT || JS_EXT) {
        const formats = {
          minimal: ".json",
          po: ".po",
          lingui: ".json",
        }
        throw new Error(
          `@lingui/snowpack-plugin: File extension is mandatory, for ex: import('./locales/en/messages${
            formats[config.format as CatalogFormat]
          }')`
        )
      }

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
        strict,
        namespace: config.compileNamespace,
        pseudoLocale: config.pseudoLocale,
      })

      return compiled
    },
  }
}
