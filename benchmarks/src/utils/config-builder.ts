import path from "path"
import fs from "fs"
import { makeConfig } from "@lingui/conf"
import type { LinguiConfigNormalized } from "@lingui/conf"
import { formatter } from "@lingui/format-po"
import { createSwcExtractor } from "lingui-swc"
import type { PresetConfig } from "../presets.js"

export function buildConfig(
  fixturesDir: string,
  preset: PresetConfig,
  useSwcExtractor = false,
): LinguiConfigNormalized {
  const absFixtures = path.resolve(fixturesDir)
  const configPath = writeConfigFile(absFixtures, preset, useSwcExtractor)

  return makeConfig(
    {
      rootDir: absFixtures,
      locales: preset.locales,
      sourceLocale: "en",
      catalogs: [
        {
          path: path.join(absFixtures, "locale/{locale}/messages"),
          include: [path.join(absFixtures, "src")],
          exclude: [],
        },
      ],
      format: formatter({ origins: true }),
      ...(useSwcExtractor ? { extractors: [createSwcExtractor()] } : {}),
    },
    { skipValidation: true, resolvedConfigPath: configPath },
  )
}

function writeConfigFile(
  fixturesDir: string,
  preset: PresetConfig,
  useSwcExtractor: boolean,
): string {
  const configPath = path.join(
    fixturesDir,
    useSwcExtractor ? "lingui.config.swc.js" : "lingui.config.js",
  )

  const extractorImport = useSwcExtractor
    ? `import { createSwcExtractor } from "lingui-swc"\n`
    : ""
  const extractorConfig = useSwcExtractor
    ? `  extractors: [createSwcExtractor()],\n`
    : ""

  const content = `
import { formatter } from "@lingui/format-po"
${extractorImport}
export default {
  locales: ${JSON.stringify(preset.locales)},
  sourceLocale: "en",
  catalogs: [{
    path: "${fixturesDir}/locale/{locale}/messages",
    include: ["${fixturesDir}/src"],
    exclude: [],
  }],
  format: formatter({ origins: true }),
${extractorConfig}}
`
  fs.writeFileSync(configPath, content)
  return configPath
}
