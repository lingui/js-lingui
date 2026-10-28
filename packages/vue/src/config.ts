import {
  defineConfig as defineLinguiConfig,
  type LinguiConfig,
} from "@lingui/conf"

const vueRuntimeModules = {
  Trans: ["@lingui/vue", "Trans"],
  useLingui: ["@lingui/vue", "useLingui"],
} as const

/**
 * `defineConfig` preconfigured for Vue: registers `@lingui/vue/macro` as a
 * JSX macro package, sets `macro.jsxRuntime` to `"vue"` and points the macro
 * runtime imports to `@lingui/vue`.
 *
 * Add `createVueExtractor()` from `@lingui/extractor-vue` to `extractors`
 * to extract messages from `.vue` files.
 */
export function defineConfig(config: LinguiConfig): LinguiConfig {
  const { runtimeConfigModule, macro, ...rest } = config
  const runtimeConfig = Array.isArray(runtimeConfigModule)
    ? {
        i18n: runtimeConfigModule as readonly [
          string,
          string?,
        ] /** ModuleSource */,
      }
    : runtimeConfigModule
  const jsxPackage = macro?.jsxPackage
    ? Array.from(new Set([...macro.jsxPackage, "@lingui/vue/macro"]))
    : ["@lingui/vue/macro"]

  return defineLinguiConfig({
    ...rest,
    macro: {
      ...macro,
      jsxPackage,
      jsxRuntime: macro?.jsxRuntime ?? "vue",
    },
    runtimeConfigModule: {
      ...vueRuntimeModules,
      ...runtimeConfig,
    },
  })
}

export type { LinguiConfig }
