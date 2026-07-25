import { LinguiConfigNormalized } from "@lingui/conf"

export const buildContentFilterRe = (config: LinguiConfigNormalized) => {
  const macroIds = new Set([
    ...config.macro.corePackage,
    ...config.macro.jsxPackage,
  ])

  // 1. Escape any special regex characters in the IDs (just in case)
  // 2. Join them with the '|' (OR) operator
  const macroPattern = Array.from(macroIds)
    .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")

  return new RegExp(`from ['"](?:${macroPattern})['"]`)
}
