import { LinguiConfig, LinguiConfigNormalized } from "../types"

type ModuleSrc = [source: string, identifier?: string]

const getSymbolSource = (
  defaults: ModuleSrc,
  config: LinguiConfig["runtimeConfigModule"]
): ModuleSrc => {
  const name = defaults[1]
  if (Array.isArray(config)) {
    if (name === "i18n") {
      return config
    }
    return defaults
  }

  return config[name] || defaults
}

export function normalizeRuntimeConfigModule(
  config: Pick<LinguiConfig, "runtimeConfigModule">
) {
  const [i18nImportModule, i18nImportName] = getSymbolSource(
    ["@lingui/core", "i18n"],
    config.runtimeConfigModule
  )
  const [TransImportModule, TransImportName] = getSymbolSource(
    ["@lingui/react", "Trans"],
    config.runtimeConfigModule
  )

  return {
    ...config,
    runtimeConfigModule: {
      i18nImportModule,
      i18nImportName,
      TransImportModule,
      TransImportName,
    } satisfies LinguiConfigNormalized["runtimeConfigModule"],
  }
}
