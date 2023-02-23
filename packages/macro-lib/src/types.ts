import type { LinguiConfigNormalized } from "@lingui/conf"

export type LinguiMacroOpts = {
  // explicitly set by CLI when running extraction process
  extract?: boolean
  linguiConfig?: LinguiConfigNormalized
}
