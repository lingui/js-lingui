import { LinguiConfig, LinguiConfigNormalized } from "../types"

type ModuleSrc = [source: string, identifier?: string]

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
  const [i18nImportModule, i18nImportName] = getSymbolSource(
    ["@lingui/core", "i18n"],
    config.runtimeConfigModule
  )
  const [TransImportModule, TransImportName] = getSymbolSource(
    ["@lingui/react", "Trans"],
    config.runtimeConfigModule
  )
  const [useLinguiImportModule, useLinguiImportName] = getSymbolSource(
    ["@lingui/react", "useLingui"],
    config.runtimeConfigModule
  )

  return {
    ...config,
    runtimeConfigModule: {
      i18nImportModule,
      i18nImportName,
      TransImportModule,
      TransImportName,
      useLinguiImportModule,
      useLinguiImportName,
    } satisfies LinguiConfigNormalized["runtimeConfigModule"],
  }
}
