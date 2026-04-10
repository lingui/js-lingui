import {
  defineConfig as defineLinguiConfig,
  type LinguiConfig,
} from "@lingui/conf"

const solidRuntimeModules = {
  Trans: ["@lingui/solid", "Trans"],
  useLingui: ["@lingui/solid", "useLingui"],
} as const

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
    ? Array.from([...macro.jsxPackage, "@lingui/solid/macro"])
    : ["@lingui/solid/macro"]

  return defineLinguiConfig({
    ...rest,
    macro: {
      ...macro,
      jsxPackage,
      jsxRuntime: macro?.jsxRuntime ?? "solid",
    },
    runtimeConfigModule: {
      ...solidRuntimeModules,
      ...runtimeConfig,
    },
  })
}

export type { LinguiConfig }
