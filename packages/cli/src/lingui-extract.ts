import pico from "picocolors"
import chokidar from "chokidar"
import { program } from "commander"
import nodepath from "path"
import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { getCatalogs, AllCatalogsType } from "./api/index.js"
import { printStats } from "./api/stats.js"
import { helpRun } from "./api/help.js"
import ora from "ora"
import normalizePath from "normalize-path"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions.js"
import {
  createExtractWorkerPool,
  ExtractWorkerPool,
} from "./api/extractWorkerPool.js"
import ms from "ms"
import { Catalog } from "./api/catalog.js"
import esMain from "es-main"
import { getPathsForExtractWatcher } from "./api/getPathsForExtractWatcher.js"
import { glob } from "glob"
import micromatch from "micromatch"

export type CliExtractOptions = {
  verbose: boolean
  files?: string[]
  clean: boolean
  overwrite: boolean
  locale?: string[]
  prevFormat?: string
  watch?: boolean
  workersOptions: WorkersOptions
}

export default async function command(
  config: LinguiConfigNormalized,
  options: CliExtractOptions,
): Promise<boolean> {
  const startTime = Date.now()
  options.verbose && console.log("Extracting messages from source files…")

  const catalogs = await getCatalogs(config)
  const catalogStats: { [path: string]: AllCatalogsType } = {}
  let commandSuccess = true

  let workerPool: ExtractWorkerPool | undefined

  // important to initialize ora before worker pool, otherwise it cause
  // MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unpipe listeners added to [WriteStream]. MaxListeners is 10. Use emitter.setMaxListeners() to increase limit
  // when workers >= 10
  const spinner = ora()

  if (options.workersOptions.poolSize) {
    options.verbose &&
      console.log(`Use worker pool of size ${options.workersOptions.poolSize}`)

    workerPool = createExtractWorkerPool(options.workersOptions)
  }

  spinner.start()

  let extractionResult: {
    catalog: Catalog
    messagesByLocale: AllCatalogsType
  }[]

  try {
    extractionResult = await Promise.all(
      catalogs.map(async (catalog) => {
        const result = await catalog.make({
          ...options,
          orderBy: config.orderBy,
          workerPool,
        })

        catalogStats[
          normalizePath(nodepath.relative(config.rootDir, catalog.path))
        ] = result || {}

        commandSuccess &&= Boolean(result)

        return { catalog, messagesByLocale: result as AllCatalogsType }
      }),
    )
  } finally {
    if (workerPool) {
      await workerPool.terminate(true)
    }
  }

  const doneMsg = `Done in ${ms(Date.now() - startTime)}`

  if (commandSuccess) {
    spinner.succeed(doneMsg)
  } else {
    spinner.fail(doneMsg)
  }

  Object.entries(catalogStats).forEach(([key, value]) => {
    console.log(`Catalog statistics for ${key}: `)
    console.log(printStats(config, value).toString())
    console.log()
  })

  if (!options.watch) {
    console.log(
      `(Use "${pico.yellow(
        helpRun("extract"),
      )}" to update catalogs with new messages.)`,
    )
    console.log(
      `(Use "${pico.yellow(
        helpRun("compile"),
      )}" to compile catalogs for production. Alternatively, use bundler plugins: https://lingui.dev/ref/cli#compiling-catalogs-in-ci)`,
    )
  }

  // If service key is present in configuration, synchronize with cloud translation platform
  if (config.service?.name?.length) {
    const moduleName =
      config.service.name.charAt(0).toLowerCase() + config.service.name.slice(1)

    const services: Record<string, any> = {
      translationIO: () => import(`./services/translationIO.js`),
    }

    if (!services[moduleName]) {
      console.error(`Can't load service module ${moduleName}`)
    }

    try {
      const module = services[moduleName]()

      await module
        .default(config, options, extractionResult)
        .then(console.log)
        .catch(console.error)
    } catch (err) {
      console.error(`Can't load service module ${moduleName}`, err)
    }
  }

  return commandSuccess
}

type CliArgs = {
  verbose: boolean
  config: string
  convertFrom: string
  debounce: number
  files?: string[]
  clean: boolean
  overwrite: boolean
  locale: string[]
  prevFormat: string | null
  watch?: boolean
  workers?: number
}

if (esMain(import.meta)) {
  program
    .option("--config <path>", "Path to the config file")
    .option(
      "--locale <locale, [...]>",
      "Only extract the specified locales",
      (value) => {
        return value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      },
    )
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8). Pass `--workers 1` to disable worker threads and run everything in a single process",
    )
    .option("--overwrite", "Overwrite translations for source locale")
    .option("--clean", "Remove obsolete translations")
    .option(
      "--debounce <delay>",
      "Debounces extraction for given amount of milliseconds",
    )
    .option("--verbose", "Verbose output")
    .option(
      "--convert-from <format>",
      "Convert from previous format of message catalogs",
    )
    .option("--watch", "Enables Watch Mode")
    .parse(process.argv)

  const options = program.opts<CliArgs>()

  const config = getConfig({
    configPath: options.config,
  })

  let hasErrors = false

  const prevFormat = options.convertFrom
  if (prevFormat && config.format === prevFormat) {
    hasErrors = true
    console.error("Trying to migrate message catalog to the same format")
    console.error(
      `Set ${pico.bold("new")} format in LinguiJS configuration\n` +
        ` and ${pico.bold("previous")} format using --convert-from option.`,
    )
    console.log()
    console.log(`Example: Convert from lingui format to minimal`)
    console.log(pico.yellow(helpRun(`extract --convert-from lingui`)))
    process.exit(1)
  }

  if (options.locale) {
    const missingLocale = options.locale.find(
      (l) => !config.locales.includes(l),
    )

    if (missingLocale) {
      hasErrors = true
      console.error(`Locale ${pico.bold(missingLocale)} does not exist.`)
      console.error()
    }
  }

  if (hasErrors) process.exit(1)

  const extract = (filePath?: string[]) => {
    return command(config, {
      verbose: options.watch || options.verbose || false,
      clean: options.watch ? false : options.clean || false,
      overwrite: options.watch || options.overwrite || false,
      locale: options.locale,
      watch: options.watch || false,
      files: filePath?.length ? filePath : undefined,
      prevFormat,
      workersOptions: resolveWorkersOptions(options),
    })
  }

  const changedPaths = new Set<string>()
  let debounceTimer: NodeJS.Timeout
  let previousExtract = Promise.resolve(true)
  const dispatchExtract = (filePath?: string[]) => {
    // Skip debouncing if not enabled but still chain them so no racing issue
    // on deleting the tmp folder.
    if (!options.debounce) {
      previousExtract = previousExtract.then(() => extract(filePath))
      return previousExtract
    }

    filePath?.forEach((path) => changedPaths.add(path))

    // CLear the previous timer if there is any, and schedule the next
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const filePath = [...changedPaths]
      changedPaths.clear()

      await extract(filePath)
    }, options.debounce)
  }

  // Check if Watch Mode is enabled
  if (options.watch) {
    console.info(pico.bold("Initializing Watch Mode..."))
    ;(async function initWatch() {
      const { paths, ignored } = await getPathsForExtractWatcher(config)

      const watcher = chokidar.watch(await glob(paths), {
        ignored: [
          "/(^|[/\\])../",
          (path: string) => micromatch.any(path, ignored),
        ],
        persistent: true,
      })

      const onReady = () => {
        console.info(pico.green(pico.bold("Watcher is ready!")))
        watcher
          .on("add", (path) => dispatchExtract([path]))
          .on("change", (path) => dispatchExtract([path]))
      }

      watcher.on("ready", () => onReady())
    })()
  } else if (program.args) {
    // this behaviour occurs when we extract files by his name
    // for ex: lingui extract src/app, this will extract only files included in src/app
    extract(program.args).then((result) => {
      if (!result) process.exit(1)
    })
  } else {
    extract().then((result) => {
      if (!result) process.exit(1)
    })
  }
}
