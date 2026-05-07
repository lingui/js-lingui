import { styleText } from "node:util"
import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { getCatalogs } from "./api/index.js"
import nodepath from "path"
import normalizePath from "normalize-path"
import {
  createExtractWorkerPool,
  ExtractWorkerPool,
} from "./api/workerPools.js"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions.js"
import { initLogger, LOG_LEVELS, LogLevel } from "./api/logger.js"

type CliExtractTemplateOptions = {
  logLevel: LogLevel
  files?: string[]
  workersOptions: WorkersOptions
}

export default async function command(
  config: LinguiConfigNormalized,
  options: CliExtractTemplateOptions,
): Promise<boolean> {
  const logger = initLogger(options.logLevel)

  logger.verbose("Extracting messages from source files…")

  const catalogs = await getCatalogs(config)
  const catalogStats: { [path: string]: number } = {}

  let commandSuccess = true

  let workerPool: ExtractWorkerPool | undefined

  if (options.workersOptions.poolSize) {
    logger.verbose(
      `Use worker pool of size ${options.workersOptions.poolSize}`,
    )

    workerPool = createExtractWorkerPool(options.workersOptions)
  }

  try {
    await Promise.all(
      catalogs.map(async (catalog) => {
        const result = await catalog.makeTemplate({
          ...options,
          orderBy: config.orderBy,
          workerPool,
        })

        if (result) {
          catalogStats[
            normalizePath(
              nodepath.relative(config.rootDir, catalog.templateFile),
            )
          ] = Object.keys(result).length
        }
        commandSuccess &&= Boolean(result)
      }),
    )
  } finally {
    if (workerPool) {
      await workerPool.destroy()
    }
  }

  Object.entries(catalogStats).forEach(([key, value]) => {
    logger.info(
      `Catalog statistics for ${styleText("bold", key)}: ${styleText("green", String(value))} messages`,
    )
    logger.info("")
  })

  return commandSuccess
}

type CliArgs = {
  config?: string
  logLevel?: LogLevel
  verbose?: boolean
  workers?: number
}

if (import.meta.main) {
  program
    .option("--config <path>", "Path to the config file")
    .option(
      "--log-level <level>",
      `Set log level (${LOG_LEVELS.join("|")})`,
    )
    .option(
      "--verbose",
      "Verbose output (alias for --log-level=verbose)",
    )
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8). Pass `--workers 1` to disable worker threads and run everything in a single process",
    )
    .parse(process.argv)

  const options = program.opts<CliArgs>()

  if (options.logLevel && !LOG_LEVELS.includes(options.logLevel)) {
    console.error(
      `Invalid --log-level "${options.logLevel}". Valid levels: ${LOG_LEVELS.join(", ")}`,
    )
    process.exit(1)
  }

  let logLevel: LogLevel = options.logLevel ?? "info"

  if (options.verbose) {
    if (options.logLevel && options.logLevel !== "verbose") {
      console.warn(
        `Warning: --verbose conflicts with --log-level=${options.logLevel}. Using --log-level=verbose.`,
      )
    }
    logLevel = "verbose"
  }

  const config = getConfig({
    configPath: options.config,
  })

  const result = command(config, {
    logLevel,
    workersOptions: resolveWorkersOptions(options),
  }).then(() => {
    if (!result) process.exit(1)
  })
}
