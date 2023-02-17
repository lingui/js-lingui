import chalk from "chalk"
import program from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { getCatalogs } from "./api/catalog"

export type CliExtractTemplateOptions = {
  verbose: boolean
  files?: string[]
}

export default async function command(
  config: LinguiConfigNormalized,
  options: Partial<CliExtractTemplateOptions>
): Promise<boolean> {
  // `react-app` babel plugin used by CRA requires either BABEL_ENV or NODE_ENV to be
  // set. We're setting it here, because lingui macros are going to use them as well.
  if (!process.env.BABEL_ENV && !process.env.NODE_ENV) {
    process.env.BABEL_ENV = "development"
  }

  options.verbose && console.log("Extracting messages from source files…")
  const catalogs = getCatalogs(config)
  const catalogStats: { [path: string]: Number } = {}

  await Promise.all(
    catalogs.map(async (catalog) => {
      await catalog.makeTemplate({
        ...(options as CliExtractTemplateOptions),
        orderBy: config.orderBy,
      })
      const catalogTemplate = catalog.readTemplate()
      if (catalogTemplate !== null && catalogTemplate !== undefined) {
        catalogStats[catalog.templateFile] = Object.keys(catalogTemplate).length
      }
    })
  )

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

  const config = getConfig({
    configPath: program.config || process.env.LINGUI_CONFIG,
  })

  const result = command(config, {
    verbose: program.verbose || false,
  }).then(() => {
    if (!result) process.exit(1)
  })
}
