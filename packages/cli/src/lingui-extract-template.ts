import pico from "picocolors"
import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { getCatalogs } from "./api"
import nodepath from "path"
import normalizePath from "normalize-path"

export type CliExtractTemplateOptions = {
  verbose: boolean
  files?: string[]
}

export default async function command(
  config: LinguiConfigNormalized,
  options: Partial<CliExtractTemplateOptions>
): Promise<boolean> {
  options.verbose && console.log("Extracting messages from source files…")
  const catalogs = await getCatalogs(config)
  const catalogStats: { [path: string]: number } = {}

  let commandSuccess = true

  await Promise.all(
    catalogs.map(async (catalog) => {
      const result = await catalog.makeTemplate({
        ...(options as CliExtractTemplateOptions),
        orderBy: config.orderBy,
      })

      if (result) {
        catalogStats[
          normalizePath(nodepath.relative(config.rootDir, catalog.templateFile))
        ] = Object.keys(result).length
      }
      commandSuccess &&= Boolean(result)
    })
  )

  Object.entries(catalogStats).forEach(([key, value]) => {
    console.log(
      `Catalog statistics for ${pico.bold(key)}: ${pico.green(
        value
      )} messages`
    )
    console.log()
  })

  return commandSuccess
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
