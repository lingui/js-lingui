import chalk from "chalk"
import program from "commander"

import { getConfig, LinguiConfig } from "@lingui/conf"

import { getCatalogs } from "./api/catalog"
import { detect } from "./api/detect"
import { ExtractorType } from "./api/extractors"

export type CliExtractTemplateOptions = {
  verbose: boolean
  configPath: string
  extractors?: ExtractorType[]
  files?: string[]
}

export default async function command(
  config: LinguiConfig,
  options: Partial<CliExtractTemplateOptions>
): Promise<boolean> {
  // `react-app` babel plugin used by CRA requires either BABEL_ENV or NODE_ENV to be
  // set. We're setting it here, because lingui macros are going to use them as well.
  if (!process.env.BABEL_ENV && !process.env.NODE_ENV) {
    process.env.BABEL_ENV = "development"
  }

  // We need macros to keep imports, so extract-messages plugin know what componets
  // to collect. Users usually use both BABEN_ENV and NODE_ENV, so it's probably
  // safer to introduce a new env variable. LINGUI_EXTRACT=1 during `lingui extract`
  process.env.LINGUI_EXTRACT = "1"

  options.verbose && console.error("Extracting messages from source files…")
  const catalogs = getCatalogs(config)
  const catalogStats: { [path: string]: Number } = {}

  await Promise.all(catalogs.map(async (catalog) => {
    await catalog.makeTemplate({
      ...options,
      orderBy: config.orderBy,
      projectType: detect(),
    })

    catalogStats[catalog.templateFile] = Object.keys(catalog.readTemplate()).length
  }))

  Object.entries(catalogStats).forEach(([key, value]) => {
    console.log(
      `Catalog statistics for ${chalk.bold(key)}: ${chalk.green(
        value
      )} messages`
    )
    console.log()
  })
  return true
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .option("--verbose", "Verbose output")
    .parse(process.argv)

  const config = getConfig({ configPath: program.config || process.env.LINGUI_CONFIG })

  const result = command(config, {
    verbose: program.verbose || false,
    configPath: program.config || process.env.LINGUI_CONFIG,
  }).then(() => {
    if (!result) process.exit(1)
  })

}
