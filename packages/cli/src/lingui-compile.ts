import pico from "picocolors"
import chokidar from "chokidar"
import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import { helpRun } from "./api/help"
import { getCatalogs, getFormat } from "./api"
import { compileLocale } from "./api/compile/compileLocale"
import { Pool, spawn, Worker } from "threads"
import { CompileWorker } from "./workers/compileWorker"
import { ProgramExit } from "./api/compile/ProgramExit"

export type CliCompileOptions = {
  verbose?: boolean
  allowEmpty?: boolean
  failOnCompileError?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
}

export async function command(
  config: LinguiConfigNormalized,
  options: CliCompileOptions
) {
  // Check config.compile.merge if catalogs for current locale are to be merged into a single compiled file
  const doMerge = !!config.catalogsMergePath

  console.log("Compiling message catalogs…")

  let errored = false

  if (!config.experimental?.multiThread) {
    // single threaded
    for (const locale of config.locales) {
      try {
        await compileLocale(locale, options, config, doMerge)
      } catch (err) {
        if (err instanceof ProgramExit) {
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

    const pool = Pool(() =>
      spawn<CompileWorker>(new Worker("../../workers/compileWorker"))
    )

    try {
      for (const locale of config.locales) {
        pool.queue(async (worker) => {
          await worker.compileLocale(
            locale,
            options,
            doMerge,
            config.resolvedConfigPath
          )
        })
      }

      await pool.completed(true)
    } finally {
      await pool.terminate()
    }
  }

  return !errored
}

type CliOptions = {
  verbose?: boolean
  allowEmpty?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
  strict?: string
  config?: string
  debounce?: number
}

if (require.main === module) {
  program
    .description(
      "Add compile message catalogs and add language data (plurals) to compiled bundle."
    )
    .option("--config <path>", "Path to the config file")
    .option("--strict", "Disable defaults for missing translations")
    .option("--verbose", "Verbose output")
    .option("--typescript", "Create Typescript definition for compiled bundle")
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

  const options = program.opts<CliOptions>()

  const config = getConfig({ configPath: options.config })

  let previousRun = Promise.resolve(true)

  const compile = () => {
    previousRun = previousRun.then(() =>
      command(config, {
        verbose: options.watch || options.verbose || false,
        allowEmpty: !options.strict,
        failOnCompileError: !!options.strict,

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

      console.log("Done!")
    })
  }
}
