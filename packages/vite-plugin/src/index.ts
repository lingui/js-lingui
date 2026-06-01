import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
  getCatalogDependentFiles,
  createMissingErrorMessage,
  createCompilationErrorMessage,
} from "@lingui/cli/api"
import type { MissingBehavior } from "@lingui/cli/api"
import path from "path"
import type { Plugin } from "vite"
import { linguiTransformerBabelPreset } from "./linguiTransformerPreset"

const fileRegex = /(\.po|\?lingui)$/
type FailOnMissingOption = boolean | MissingBehavior

export type LinguiPluginOpts = {
  cwd?: string
  configPath?: string
  skipValidation?: boolean

  /**
   * If true would fail compilation on missing translations after fallbackLocales are applied
   **/
  failOnMissing?: FailOnMissingOption

  /**
   * If true would fail compilation on message compilation errors
   **/
  failOnCompileError?: boolean
}

function isFailOnMissingEnabled(option: FailOnMissingOption | undefined) {
  return option === true || option === "resolved" || option === "catalog"
}

function getFailOnMissingBehavior(
  option: FailOnMissingOption | undefined,
): MissingBehavior {
  return option === "catalog" ? "catalog" : "resolved"
}

function formatFailOnMissingOption(option: FailOnMissingOption | undefined) {
  if (option === true) return "true"
  if (option === "resolved") return '"resolved"'
  if (option === "catalog") return '"catalog"'
  return "false"
}

export function lingui({
  failOnMissing,
  failOnCompileError,
  ...linguiConfig
}: LinguiPluginOpts = {}): Plugin[] {
  let config: LinguiConfigNormalized

  return [
    {
      name: "vite-plugin-lingui-get-config",
      enforce: "pre",
      configResolved: () => {
        config = getConfig(linguiConfig)
      },
    },
    {
      name: "vite-plugin-lingui-load-catalog",
      transform: {
        filter: {
          id: fileRegex,
        },
        async handler(src, id) {
          // Additional check for backward compatibility, don't need for Rolldown powered Vite versions (8+)
          if (!fileRegex.test(id)) {
            return
          }

          id = id.split("?")[0]!

          const catalogRelativePath = path.relative(config.rootDir, id)

          const fileCatalog = getCatalogForFile(
            catalogRelativePath,
            await getCatalogs(config),
          )

          if (!fileCatalog) {
            throw new Error(
              `Requested resource ${catalogRelativePath} is not matched to any of your catalogs paths specified in "lingui.config".

Resource: ${id}

Your catalogs:
${config.catalogs.map((c) => c.path).join("\n")}
Please check that catalogs.path is filled properly.\n`,
            )
          }

          const { locale, catalog } = fileCatalog

          const dependency = await getCatalogDependentFiles(catalog, locale)
          dependency.forEach((file) => this.addWatchFile(file))
          const missingBehavior = getFailOnMissingBehavior(failOnMissing)

          const { messages, missing: missingMessages } =
            await catalog.getTranslations(locale, {
              fallbackLocales: config.fallbackLocales,
              sourceLocale: config.sourceLocale,
              missingBehavior,
            })

          if (
            isFailOnMissingEnabled(failOnMissing) &&
            locale !== config.pseudoLocale &&
            missingMessages.length > 0
          ) {
            const message = createMissingErrorMessage(
              locale,
              missingMessages,
              missingBehavior,
            )
            throw new Error(
              `${message}\nYou see this error because \`failOnMissing=${formatFailOnMissingOption(failOnMissing)}\` in Vite Plugin configuration.`,
            )
          }

          const { source: code, errors } = createCompiledCatalog(
            locale,
            messages,
            {
              namespace: "es",
              pseudoLocale: config.pseudoLocale,
            },
          )

          if (errors.length) {
            const message = createCompilationErrorMessage(locale, errors)

            if (failOnCompileError) {
              throw new Error(
                message +
                  `These errors fail build because \`failOnCompileError=true\` in Lingui Vite plugin configuration.`,
              )
            } else {
              this.warn(
                message +
                  `You can fail the build on these errors by setting \`failOnCompileError=true\` in Lingui Vite Plugin configuration.`,
              )
            }
          }

          return {
            code,
            map: null, // provide source map if available
            // Vite 8+ (Rolldown) auto-detects module types by file extension.
            // Since .po files are transformed to JS, we must explicitly declare
            // the module type to avoid misinterpretation.
            moduleType: "js",
          }
        },
      },
    },
  ]
}

export default lingui
export { linguiTransformerBabelPreset }
