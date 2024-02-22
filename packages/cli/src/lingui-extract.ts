import chalk from "chalk"
import chokidar from "chokidar"
import { program } from "commander"
import nodepath from "path"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { getCatalogs, AllCatalogsType } from "./api"
import { printStats } from "./api/stats"
import { helpRun } from "./api/help"
import ora from "ora"
import { normalizeSlashes } from "./api/utils"

export type CliExtractOptions = {
  verbose: boolean
  files?: string[]
  clean: boolean
  overwrite: boolean
  locale: string[]
  prevFormat: string | null
  watch?: boolean
}

export default async function command(
  config: LinguiConfigNormalized,
  options: Partial<CliExtractOptions>
): Promise<boolean> {
  options.verbose && console.log("Extracting messages from source files…")

  const catalogs = await getCatalogs(config)
  const catalogStats: { [path: string]: AllCatalogsType } = {}
  let commandSuccess = true

  const spinner = ora().start()

  for (let catalog of catalogs) {
    const result = await catalog.make({
      ...(options as CliExtractOptions),
      orderBy: config.orderBy,
    })

    catalogStats[
      normalizeSlashes(nodepath.relative(config.rootDir, catalog.path))
    ] = result || {}

    commandSuccess &&= Boolean(result)
  }

  if (commandSuccess) {
    spinner.succeed()
  } else {
    spinner.fail()
  }

  Object.entries(catalogStats).forEach(([key, value]) => {
    console.log(`Catalog statistics for ${key}: `)
    console.log(printStats(config, value).toString())
    console.log()
  })

  if (!options.watch) {
    console.log(
      `(use "${chalk.yellow(
        helpRun("extract")
      )}" to update catalogs with new messages)`
    )
    console.log(
      `(use "${chalk.yellow(
        helpRun("compile")
      )}" to compile catalogs for production)`
    )
  }

  // If service key is present in configuration, synchronize with cloud translation platform
  if (
    typeof config.service === "object" &&
    config.service.name &&
    config.service.name.length
  ) {
    const moduleName =
      config.service.name.charAt(0).toLowerCase() + config.service.name.slice(1)

    try {
      const module = require(`./services/${moduleName}`)

      await module
        .default(config, options)
        .then(console.log)
        .catch(console.error)
    } catch (err) {
      console.error(`Can't load service module ${moduleName}`, err)
    }
  }

  return commandSuccess
}

type CliOptions = {
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
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .option(
      "--locale <locale, [...]>",
      "Only extract the specified locales",
      (value) => {
        return value.split(",").filter(Boolean)
      }
    )
    .option("--overwrite", "Overwrite translations for source locale")
    .option("--clean", "Remove obsolete translations")
    .option(
      "--debounce <delay>",
      "Debounces extraction for given amount of milliseconds"
    )
    .option("--verbose", "Verbose output")
    .option(
      "--convert-from <format>",
      "Convert from previous format of message catalogs"
    )
    .option("--watch", "Enables Watch Mode")
    .parse(process.argv)

  const options = program.opts<CliOptions>()

  const config = getConfig({
    configPath: options.config,
  })

  let hasErrors = false

  const prevFormat = options.convertFrom
  if (prevFormat && config.format === prevFormat) {
    hasErrors = true
    console.error("Trying to migrate message catalog to the same format")
    console.error(
      `Set ${chalk.bold("new")} format in LinguiJS configuration\n` +
        ` and ${chalk.bold("previous")} format using --convert-from option.`
    )
    console.log()
    console.log(`Example: Convert from lingui format to minimal`)
    console.log(chalk.yellow(helpRun(`extract --convert-from lingui`)))
    process.exit(1)
  }

  if (options.locale) {
    const missingLocale = options.locale.find(
      (l) => !config.locales.includes(l)
    )

    if (missingLocale) {
      hasErrors = true
      console.error(`Locale ${chalk.bold(missingLocale)} does not exist.`)
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
    })
  }

  const changedPaths = new Set<string>()
  let debounceTimer: NodeJS.Timer
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
    console.info(chalk.bold("Initializing Watch Mode..."))
    ;(async function initWatch() {
      const catalogs = await getCatalogs(config)
      let paths: string[] = []
      let ignored: string[] = []

      catalogs.forEach((catalog) => {
        paths.push(...catalog.include)
        ignored.push(...catalog.exclude)
      })

      const watcher = chokidar.watch(paths, {
        ignored: ["/(^|[/\\])../", ...ignored],
        persistent: true,
      })

      const onReady = () => {
        console.info(chalk.green.bold("Watcher is ready!"))
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
