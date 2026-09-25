import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import {
  createCompiledCatalog,
  getCatalogs,
  getCatalogForFile,
  getCatalogDependentFiles,
  createMissingErrorMessage,
  createCompilationErrorMessage,
  isFailOnMissingEnabled,
  getFailOnMissingBehavior,
  formatFailOnMissingOption,
} from "@lingui/cli/api"
import type { FailOnMissingOption } from "@lingui/cli/api"
import path from "path"
import type { Plugin } from "vite"
import { linguiTransformerBabelPreset } from "./linguiTransformerPreset"
import { buildMacroFilterRe } from "./buildMacroFilterRe"
import {
  transform as transformMacro,
  mapMacroOptions,
} from "@lingui/native-tools"
import type { LinguiMacroOptions } from "@lingui/native-tools"

const fileRegex = /(\.po|\?lingui)$/

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

  /**
   * Enable native macro transformation via `@lingui/native-tools`.
   * When enabled, you don't need `@rolldown/plugin-babel` or SWC pipeline for macro transformation.
   *
   * Native transform is up to 2.7x times faster than SWC + Plugin and 29x times faster that babel.
   *
   * Will be a default option in the next major release
   *
   * Pass `true` to enable with default options, or an object to override specific `LinguiMacroOptions`.
   *
   * @default false
   **/
  macroTransform?: boolean | Partial<LinguiMacroOptions>
}

export function lingui({
  failOnMissing,
  failOnCompileError,
  macroTransform,
  ...linguiConfigOpts
}: LinguiPluginOpts = {}): Plugin[] {
  let config: LinguiConfigNormalized

  const getOrLoadConfig = () => {
    if (!config) {
      config = getConfig(linguiConfigOpts)
    }
    return config
  }

  const plugins: Plugin[] = [
    {
      name: "vite-plugin-lingui-get-config",
      enforce: "pre",

      configResolved: () => {
        getOrLoadConfig()
      },
    },
  ]

  if (macroTransform) {
    const earlyConfig = getOrLoadConfig()
    const hasMacroRe = buildMacroFilterRe(earlyConfig)
    const macroOverrides =
      typeof macroTransform === "object" ? macroTransform : undefined

    plugins.push({
      name: "vite-plugin-lingui-macro-transform",
      enforce: "pre",
      transform: {
        filter: {
          id: /\.(?:[jt]sx?|[cm][jt]s)(?:$|\?)/,
          code: hasMacroRe,
        },
        async handler(code, id) {
          const result = await transformMacro(code, path.basename(id), {
            macro: mapMacroOptions(config, macroOverrides),
          })

          return { code: result?.code ?? undefined, map: result?.map }
        },
      },
    })
  }

  plugins.push({
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

        const pseudoLocaleConfig = config.pseudoLocale.find(
          (item) => item.locale === locale,
        )

        if (
          isFailOnMissingEnabled(failOnMissing) &&
          !pseudoLocaleConfig &&
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
            pseudoLocale: pseudoLocaleConfig?.locale,
            pseudoLocaleOptions: pseudoLocaleConfig?.options,
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
  })

  return plugins
}

export default lingui
export { linguiTransformerBabelPreset }
