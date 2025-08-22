import pico from "picocolors"
import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { getCatalogs } from "./api"
import nodepath from "path"
import normalizePath from "normalize-path"
import {
  createExtractWorkerPool,
  ExtractWorkerPool,
} from "./api/extractWorkerPool"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions"

export type CliExtractTemplateOptions = {
  verbose: boolean
  files?: string[]
  workersOptions: WorkersOptions
}

export default async function command(
  config: LinguiConfigNormalized,
  options: Partial<CliExtractTemplateOptions>
): Promise<boolean> {
  options.verbose && console.log("Extracting messages from source files…")
  const catalogs = await getCatalogs(config)
  const catalogStats: { [path: string]: number } = {}

  let commandSuccess = true

  let workerPool: ExtractWorkerPool

  if (options.workersOptions.poolSize) {
    console.log(`Use worker pool of size ${options.workersOptions.poolSize}`)

    workerPool = createExtractWorkerPool()
  }

  try {
    await Promise.all(
      catalogs.map(async (catalog) => {
        const result = await catalog.makeTemplate({
          ...(options as CliExtractTemplateOptions),
          orderBy: config.orderBy,
          workerPool,
        })

        if (result) {
          catalogStats[
            normalizePath(
              nodepath.relative(config.rootDir, catalog.templateFile)
            )
          ] = Object.keys(result).length
        }
        commandSuccess &&= Boolean(result)
      })
    )
  } finally {
    if (workerPool) {
      await workerPool.terminate()
    }
  }
  Object.entries(catalogStats).forEach(([key, value]) => {
    console.log(
      `Catalog statistics for ${pico.bold(key)}: ${pico.green(value)} messages`
    )
    console.log()
  })

  return commandSuccess
}

type CliArgs = {
  config?: string
  verbose?: boolean
  workers?: number | false
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .option("--verbose", "Verbose output")
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8). Pass `--workers 1` or `--no-workers` to disable worker threads and run everything in a single process"
    )
    .parse(process.argv)

  const options = program.opts<CliArgs>()

  const config = getConfig({
    configPath: options.config,
  })

  const result = command(config, {
    verbose: options.verbose || false,
    workersOptions: resolveWorkersOptions(options),
  }).then(() => {
    if (!result) process.exit(1)
  })
}
