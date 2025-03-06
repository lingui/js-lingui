import { getConfig } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
  getCatalogDependentFiles,
  createMissingErrorMessage,
} from "@lingui/cli/api"
import path from "path"
import type { Plugin } from "vite"

const fileRegex = /(\.po|\?lingui)$/

export type LinguiPluginOpts = {
  cwd?: string
  configPath?: string
  skipValidation?: boolean

  /**
   * If true would fail compilation on missing translations
   **/
  failOnMissing?: boolean
}

export function lingui({
  failOnMissing,
  ...linguiConfig
}: LinguiPluginOpts = {}): Plugin[] {
  const config = getConfig(linguiConfig)

  return [
    {
      name: "vite-plugin-lingui-report-macro-error",
      enforce: "pre",
      resolveId(id) {
        if (
          id.includes("@lingui/macro") ||
          id.includes("@lingui/core/macro") ||
          id.includes("@lingui/react/macro")
        ) {
          throw new Error(
            `The macro you imported from "${id}" is being executed outside the context of compilation. \n` +
              `This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro"` +
              `Please see the documentation for how to configure Vite with Lingui correctly: ` +
              "https://lingui.dev/tutorials/setup-vite"
          )
        }
      },
    },
    {
      name: "vite-plugin-lingui",
      config: (config) => {
        // https://github.com/lingui/js-lingui/issues/1464
        if (!config.optimizeDeps) {
          config.optimizeDeps = {}
        }
        config.optimizeDeps.exclude = config.optimizeDeps.exclude || []
        config.optimizeDeps.exclude.push("@lingui/macro")
        config.optimizeDeps.exclude.push("@lingui/core/macro")
        config.optimizeDeps.exclude.push("@lingui/react/macro")
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

          const dependency = await getCatalogDependentFiles(catalog, locale)
          dependency.forEach((file) => this.addWatchFile(file))

          const { messages, missing: missingMessages } =
            await catalog.getTranslations(locale, {
              fallbackLocales: config.fallbackLocales,
              sourceLocale: config.sourceLocale,
            })

          if (
            failOnMissing &&
            locale !== config.pseudoLocale &&
            missingMessages.length > 0
          ) {
            throw new Error(
              createMissingErrorMessage(locale, missingMessages, "Vite plugin")
            )
          }

          const compiled = createCompiledCatalog(locale, messages, {
            namespace: "es",
            pseudoLocale: config.pseudoLocale,
          })

          return {
            code: compiled,
            map: null, // provide source map if available
          }
        }
      },
    },
  ]
}

export default lingui
