import path from "path"
import fs from "fs"
import type { PresetConfig } from "../presets.js"

export function writeConfigs(fixturesDir: string, preset: PresetConfig) {
  const absFixtures = path.resolve(fixturesDir)

  const babelConfigPath = path.join(absFixtures, "lingui.config.babel.mjs")
  const swcConfigPath = path.join(absFixtures, "lingui.config.swc.mjs")

  const baseConfig = `
import { formatter } from "@lingui/format-po"

export default {
  locales: ${JSON.stringify(preset.locales)},
  sourceLocale: "en",
  catalogs: [{
    path: "<rootDir>/locale/{locale}/messages",
    include: ["<rootDir>/src"],
    exclude: [],
  }],
  format: formatter(),
}
`

  const swcConfig = `
import { formatter } from "@lingui/format-po"
import { createSwcExtractor } from "lingui-swc"

export default {
  locales: ${JSON.stringify(preset.locales)},
  sourceLocale: "en",
  catalogs: [{
    path: "<rootDir>/locale/{locale}/messages",
    include: ["<rootDir>/src"],
    exclude: [],
  }],
  format: formatter(),
  extractors: [createSwcExtractor()],
}
`
  fs.writeFileSync(babelConfigPath, baseConfig)
  fs.writeFileSync(swcConfigPath, swcConfig)

  return {
    babel: babelConfigPath,
    swc: swcConfigPath,
  }
}
