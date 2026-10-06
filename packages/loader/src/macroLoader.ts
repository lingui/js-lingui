import path from "path"
import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import type { LinguiMacroOptions, TransformOptions } from "@lingui/native-tools"
import type { LoaderDefinitionFunction } from "webpack"

export type LinguiMacroLoaderOptions = {
  config?: string

  parser?: TransformOptions["parser"]

  /**
   * Overrides for macro options inherited from the Lingui config.
   */
  macro?: Partial<LinguiMacroOptions>
}

type LoaderState = {
  config: LinguiConfigNormalized
  hasMacroRe: RegExp
}

const stateCache = new Map<string, LoaderState>()

let nativeTools: typeof import("@lingui/native-tools") | undefined

function buildMacroFilterRe(config: LinguiConfigNormalized): RegExp {
  const macroIds = new Set([
    ...config.macro.corePackage,
    ...config.macro.jsxPackage,
  ])

  const macroPattern = Array.from(macroIds)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")

  return new RegExp(`from ['"](?:${macroPattern})['"]`)
}

function getState(options: LinguiMacroLoaderOptions, rootContext: string) {
  const cwd = rootContext || process.cwd()
  const key = `${options.config ?? ""}\0${cwd}`

  let state = stateCache.get(key)

  if (!state) {
    const config = getConfig({ configPath: options.config, cwd })

    if (config.macro?.jsxRuntime === "solid") {
      throw new Error(
        `[@lingui/loader/macro] The native macro transform doesn't support macro.jsxRuntime: "solid" yet. ` +
          `Transform macros with @lingui/babel-plugin-lingui-macro instead.`,
      )
    }

    state = { config, hasMacroRe: buildMacroFilterRe(config) }
    stateCache.set(key, state)
  }

  return state
}

const macroLoader: LoaderDefinitionFunction<LinguiMacroLoaderOptions> =
  function (source, inputMap) {
    const callback = this.async()
    const options = this.getOptions() || {}

    let state: LoaderState
    try {
      state = getState(options, this.rootContext)
    } catch (e) {
      return callback(e as Error)
    }

    if (!state.hasMacroRe.test(source)) {
      return callback(null, source, inputMap)
    }

    const run = async () => {
      if (!nativeTools) {
        nativeTools = await import("@lingui/native-tools")
      }

      const { transform, mapMacroOptions } = nativeTools

      return transform(source, path.basename(this.resourcePath), {
        macro: {
          descriptorFields:
            process.env.NODE_ENV === "production" ? "id-only" : "all",
          ...mapMacroOptions(state.config, options.macro),
        },
        parser: options.parser,
        sourceMaps: this.sourceMap ?? true,
      })
    }

    run().then(
      (result) => callback(null, result.code, result.map ?? undefined),
      (e) => callback(e as Error),
    )
  }

export default macroLoader
