import { LinguiConfig, LinguiConfigNormalized } from "../types"

type ModuleSrc = [source: string, identifier: string]

const getSymbolSource = (
  defaults: ModuleSrc,
  config: LinguiConfig["runtimeConfigModule"]
): ModuleSrc => {
  const name = defaults[1]
  if (Array.isArray(config)) {
    if (name === "i18n") {
      return config as ModuleSrc
    }
    return defaults
  }

  const override = (config as any)[name] as ModuleSrc

  if (!override) {
    return defaults
  }

  return [override[0], override[1] || name]
}

export function normalizeRuntimeConfigModule(
  config: Pick<LinguiConfig, "runtimeConfigModule">
) {
  return {
    ...config,
    runtimeConfigModule: {
      i18n: getSymbolSource(
        ["@lingui/core", "i18n"],
        config.runtimeConfigModule
      ),
      useLingui: getSymbolSource(
        ["@lingui/react", "useLingui"],
        config.runtimeConfigModule
      ),
      Trans: getSymbolSource(
        ["@lingui/react", "Trans"],
        config.runtimeConfigModule
      ),
    } satisfies LinguiConfigNormalized["runtimeConfigModule"],
  }
}
