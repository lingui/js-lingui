import pico from "picocolors"
import chokidar from "chokidar"
import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { helpRun } from "./api/help.js"
import { getCatalogs, getFormat } from "./api/index.js"
import { compileLocale } from "./api/compile/compileLocale.js"
import { Pool, spawn, Worker } from "threads"
import { CompileWorker } from "./workers/compileWorker.js"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions.js"
import ms from "ms"

export type CliCompileOptions = {
  verbose?: boolean
  allowEmpty?: boolean
  failOnCompileError?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
  workersOptions: WorkersOptions
}

export async function command(
  config: LinguiConfigNormalized,
  options: CliCompileOptions
) {
  const startTime = Date.now()

  // Check config.compile.merge if catalogs for current locale are to be merged into a single compiled file
  const doMerge = !!config.catalogsMergePath

  console.log("Compiling message catalogs…")

  let errored = false

  if (!options.workersOptions.poolSize) {
    // single threaded
    const catalogs = await getCatalogs(config)

    for (const locale of config.locales) {
      try {
        await compileLocale(catalogs, locale, options, config, doMerge, console)
      } catch (err) {
        if ((err as Error).name === "ProgramExit") {
          errored = true
        } else {
          throw err
        }
      }
    }
  } else {
    if (!config.resolvedConfigPath) {
      throw new Error(
        "Multithreading is only supported when lingui config loaded from file system, not passed by API"
      )
    }

    options.verbose &&
      console.log(`Use worker pool of size ${options.workersOptions.poolSize}`)

    const pool = Pool(
      () => spawn<CompileWorker>(new Worker("./workers/compileWorker")),
      { size: options.workersOptions.poolSize }
    )

    try {
      for (const locale of config.locales) {
        pool.queue(async (worker) => {
          const { logs, error, exitProgram } = await worker.compileLocale(
            locale,
            options,
            doMerge,
            config.resolvedConfigPath
          )

          if (logs.errors) {
            console.error(logs.errors)
          }

          if (exitProgram) {
            errored = true
            return
          }

          if (error) {
            throw error
          }
        })
      }

      await pool.completed(true)
    } finally {
      await pool.terminate(true)
    }
  }

  console.log(`Done in ${ms(Date.now() - startTime)}`)

  return !errored
}

type CliArgs = {
  verbose?: boolean
  allowEmpty?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
  strict?: string
  config?: string
  debounce?: number
  workers?: number
}

if (require.main === module) {
  program
    .description("Compile message catalogs to compiled bundle.")
    .option("--config <path>", "Path to the config file")
    .option("--strict", "Disable defaults for missing translations")
    .option("--verbose", "Verbose output")
    .option("--typescript", "Create Typescript definition for compiled bundle")
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8). Pass `--workers 1` to disable worker threads and run everything in a single process"
    )
    .option(
      "--namespace <namespace>",
      "Specify namespace for compiled bundle. Ex: cjs(default) -> module.exports, es -> export, window.test -> window.test"
    )
    .option("--watch", "Enables Watch Mode")
    .option(
      "--debounce <delay>",
      "Debounces compilation for given amount of milliseconds"
    )
    .on("--help", function () {
      console.log("\n  Examples:\n")
      console.log(
        "    # Compile translations and use defaults or message IDs for missing translations"
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

  const config = getConfig({ configPath: options.config })

  let previousRun = Promise.resolve(true)

  const compile = () => {
    previousRun = previousRun.then(() =>
      command(config, {
        verbose: options.watch || options.verbose || false,
        allowEmpty: !options.strict,
        failOnCompileError: !!options.strict,
        workersOptions: resolveWorkersOptions(options),
        typescript:
          options.typescript || config.compileNamespace === "ts" || false,
        namespace: options.namespace, // we want this to be undefined if user does not specify so default can be used
      })
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

  // Check if Watch Mode is enabled
  if (options.watch) {
    console.info(pico.bold("Initializing Watch Mode..."))
    ;(async function initWatch() {
      const format = await getFormat(
        config.format,
        config.formatOptions,
        config.sourceLocale
      )
      const catalogs = await getCatalogs(config)

      const paths: string[] = []

      config.locales.forEach((locale) => {
        catalogs.forEach((catalog) => {
          paths.push(
            `${catalog.path
              .replace(/{locale}/g, locale)
              .replace(/{name}/g, "*")}${format.getCatalogExtension()}`
          )
        })
      })

      const watcher = chokidar.watch(paths, {
        persistent: true,
      })

      const onReady = () => {
        console.info(pico.green(pico.bold("Watcher is ready!")))
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
