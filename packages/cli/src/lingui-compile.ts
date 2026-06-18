import { styleText } from "node:util"
import { watch } from "chokidar"
import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { helpRun } from "./api/help.js"
import { getCatalogs } from "./api/index.js"
import { compileLocale } from "./api/compile/compileLocale.js"
import { createCompileWorkerPool } from "./api/workerPools.js"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions.js"
import ms from "ms"
import { getPathsForCompileWatcher } from "./api/getPathsForCompileWatcher.js"
import { initLogger, LOG_LEVELS, LogLevel } from "./api/logger.js"

export type CliCompileOptions = {
  logLevel: LogLevel
  allowEmpty?: boolean
  failOnCompileError?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
  workersOptions: WorkersOptions
  outputPrefix?: string
}

export async function command(
  config: LinguiConfigNormalized,
  options: CliCompileOptions,
) {
  const startTime = Date.now()
  const logger = initLogger(options.logLevel)

  // Check config.compile.merge if catalogs for current locale are to be merged into a single compiled file
  const doMerge = !!config.catalogsMergePath

  logger.info("Compiling message catalogs…")

  let errored = false

  if (!options.workersOptions.poolSize) {
    // single threaded
    const catalogs = await getCatalogs(config)

    for (const locale of config.locales) {
      try {
        await compileLocale(catalogs, locale, options, config, doMerge, logger)
      } catch (err) {
        if ((err as Error).name === "ProgramExit") {
          errored = true
        } else {
          throw err
        }
      }
    }
  } else {
    const resolvedConfigPath = config.resolvedConfigPath
    if (!resolvedConfigPath) {
      throw new Error(
        "Multithreading is only supported when lingui config loaded from file system, not passed by API",
      )
    }

    logger.verbose(`Use worker pool of size ${options.workersOptions.poolSize}`)

    const pool = createCompileWorkerPool({
      poolSize: options.workersOptions.poolSize,
    })

    try {
      await Promise.all(
        config.locales.map(async (locale) => {
          const { logs, error, exitProgram } = await pool.run(
            locale,
            options,
            doMerge,
            resolvedConfigPath,
          )

          if (logs.errors) {
            logger.error(logs.errors)
          }

          if (exitProgram) {
            errored = true
            return
          }

          if (error) {
            throw error
          }
        }),
      )
    } finally {
      await pool.destroy()
    }
  }

  logger.info(`Done in ${ms(Date.now() - startTime)}`)

  return !errored
}

type CliArgs = {
  logLevel?: LogLevel
  verbose?: boolean
  allowEmpty?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
  strict?: string
  config?: string
  debounce?: number
  workers?: number
  outputPrefix?: string
}

if (import.meta.main) {
  program
    .description("Compile message catalogs to compiled bundle.")
    .option("--config <path>", "Path to the config file")
    .option("--strict", "Disable defaults for missing translations")
    .option("--log-level <level>", `Set log level (${LOG_LEVELS.join("|")})`)
    .option("--verbose", "Verbose output (alias for --log-level=verbose)")
    .option("--typescript", "Create Typescript definition for compiled bundle")
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8). Pass `--workers 1` to disable worker threads and run everything in a single process",
    )
    .option(
      "--namespace <namespace>",
      "Specify namespace for compiled bundle. Ex: cjs(default) -> module.exports, es -> export, window.test -> window.test",
    )
    .option("--watch", "Enables Watch Mode")
    .option(
      "--debounce <delay>",
      "Debounces compilation for given amount of milliseconds",
    )
    .option(
      "--output-prefix <prefix>",
      "Add a custom string to the beginning of compiled files (header/prefix). Useful for tools like linters or coverage directives. Defaults to '/*eslint-disable*/'",
    )
    .on("--help", function () {
      console.log("\n  Examples:\n")
      console.log(
        "    # Compile translations and use defaults or message IDs for missing translations",
      )
      console.log(`    $ ${helpRun("compile")}`)
      console.log("")
      console.log("    # Compile translations but fail when there are missing")
      console.log("    # translations (don't replace missing translations with")
      console.log("    # default messages or message IDs)")
      console.log(`    $ ${helpRun("compile --strict")}`)
    })
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

  const config = getConfig({ configPath: options.config })

  let previousRun = Promise.resolve(true)

  const compile = () => {
    previousRun = previousRun.then(() =>
      command(config, {
        logLevel,
        allowEmpty: !options.strict,
        failOnCompileError: !!options.strict,
        workersOptions: resolveWorkersOptions(options),
        typescript:
          options.typescript || config.compileNamespace === "ts" || false,
        namespace: options.namespace, // we want this to be undefined if user does not specify so default can be used
        outputPrefix: options.outputPrefix,
      }),
    )

    return previousRun
  }

  let debounceTimer: NodeJS.Timeout

  const dispatchCompile = () => {
    // Skip debouncing if not enabled
    if (!options.debounce) compile()

    // CLear the previous timer if there is any, and schedule the next
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => compile(), options.debounce)
  }

  const logger = initLogger(logLevel)

  // Check if Watch Mode is enabled
  if (options.watch) {
    logger.info(styleText("bold", "Initializing Watch Mode..."))
    ;(async function initWatch() {
      const { paths } = await getPathsForCompileWatcher(config)

      const watcher = watch(paths, {
        persistent: true,
      })

      const onReady = () => {
        logger.info(styleText(["green", "bold"], "Watcher is ready!"))
        watcher
          .on("add", () => dispatchCompile())
          .on("change", () => dispatchCompile())
      }

      watcher.on("ready", () => onReady())
    })()
  } else {
    compile().then((results) => {
      if (!results) {
        process.exit(1)
      }
    })
  }
}
