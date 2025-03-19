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

export function lingui(linguiConfig: LinguiConfigOpts = {}): Plugin[] {
  const config = getConfig(linguiConfig)

  const macroIds = new Set([
    ...config.macro.corePackage,
    ...config.macro.jsxPackage,
  ])

  return [
    {
      name: "vite-plugin-lingui-report-macro-error",
      enforce: "pre",
      resolveId(id) {
        if (macroIds.has(id)) {
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

        for (const macroId of macroIds) {
          config.optimizeDeps.exclude.push(macroId)
        }
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
    },
  ]
}

export default lingui
