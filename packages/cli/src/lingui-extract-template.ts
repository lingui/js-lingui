import chalk from "chalk"
import { program } from "commander"

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

type CliOptions = {
  config?: string
  verbose?: boolean
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .option("--verbose", "Verbose output")
    .parse(process.argv)

  const options = program.opts<CliOptions>()

  const config = getConfig({
    configPath: options.config,
  })

  const result = command(config, {
    verbose: options.verbose || false,
  }).then(() => {
    if (!result) process.exit(1)
  })
}
