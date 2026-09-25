import { LinguiConfigNormalized } from "@lingui/conf"

export function buildMacroFilterRe(config: LinguiConfigNormalized): RegExp {
  const macroIds = new Set([
    ...config.macro.corePackage,
    ...config.macro.jsxPackage,
  ])

  const macroPattern = Array.from(macroIds)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")

  return new RegExp(`from ['"](?:${macroPattern})['"]`)
}
