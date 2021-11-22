import chalk from "chalk"
import chokidar from "chokidar"
import program from "commander"

import { getConfig, LinguiConfig } from "@lingui/conf"

import { AllCatalogsType, getCatalogs } from "./api/catalog"
import { printStats } from "./api/stats"
import { detect } from "./api/detect"
import { helpRun } from "./api/help"
import { ExtractorType } from "./api/extractors"

export type CliExtractOptions = {
  verbose: boolean
  files?: string[]
  clean: boolean
  extractors?: ExtractorType[]
  configPath: string
  overwrite: boolean
  locale: string
  prevFormat: string | null
  watch?: boolean
}

export default async function command(
  config: LinguiConfig,
  options: Partial<CliExtractOptions>
): Promise<boolean> {
  // `react-app` babel plugin used by CRA requires either BABEL_ENV or NODE_ENV to be
  // set. We're setting it here, because lingui macros are going to use them as well.
  if (!process.env.BABEL_ENV && !process.env.NODE_ENV) {
    process.env.BABEL_ENV = "development"
  }

  // We need macros to keep imports, so extract-messages plugin know what componets
  // to collect. Users usually use both BABEN_ENV and NODE_ENV, so it's probably
  // safer to introduce a new env variable. LINGUI_EXTRACT=1 during `lingui extract`
  process.env.LINGUI_EXTRACT = "1"

  options.verbose && console.error("Extracting messages from source files…")

  const catalogs = getCatalogs(config)
  const catalogStats: { [path: string]: AllCatalogsType } = {}
  for (let catalog of catalogs) {
    await catalog.make({
      ...options,
      orderBy: config.orderBy,
      extractors: config.extractors,
      projectType: detect(),
    })

    catalogStats[catalog.path] = catalog.readAll()
  }

  Object.entries(catalogStats).forEach(([key, value]) => {
    console.log(`Catalog statistics for ${key}: `)
    console.log(printStats(config, value).toString())
    console.log()
  })

  if (!options.watch) {
    console.error(
      `(use "${chalk.yellow(
        helpRun("extract")
      )}" to update catalogs with new messages)`
    )
    console.error(
      `(use "${chalk.yellow(
        helpRun("compile")
      )}" to compile catalogs for production)`
    )
  }

  // If service key is present in configuration, synchronize with cloud translation platform
  if (typeof config.service === 'object' && config.service.name && config.service.name.length) {
    import(`./services/${config.service.name}`)
      .then(module => module.default(config, options))
      .catch(err => console.error(`Can't load service module ${config.service.name}`, err))
  }

  return true
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .option("--locale <locale>", "Only extract the specified locale")
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
    // Obsolete options
    .option(
      "--babelOptions",
      "Babel options passed to transform/extract plugins"
    )
    .option("--format <format>", "Format of message catalogs")
    .parse(process.argv)

  const config = getConfig({
    configPath: program.config || process.env.LINGUI_CONFIG,
  })

  let hasErrors = false
  if (program.format) {
    hasErrors = true
    const msg =
      "--format option is deprecated." +
      " Please set format in configuration https://lingui.js.org/ref/conf.html#format"
    console.error(msg)
    console.error()
  }

  if (program.babelOptions) {
    hasErrors = true
    const msg =
      "--babelOptions option is deprecated." +
      " Please set extractBabelOptions in configuration https://lingui.js.org/ref/conf.html#extractBabelOptions"
    console.error(msg)
    console.error()
  }

  const prevFormat = program.convertFrom
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

  if (program.locale && !config.locales.includes(program.locale)) {
    hasErrors = true
    console.error(`Locale ${chalk.bold(program.locale)} does not exist.`)
    console.error()
  }

  if (hasErrors) process.exit(1)

  const extract = (filePath?: string[]) => {
    return command(config, {
      verbose: program.watch || program.verbose || false,
      clean: program.watch ? false : program.clean || false,
      overwrite: program.watch || program.overwrite || false,
      locale: program.locale,
      configPath: program.config || process.env.LINGUI_CONFIG,
      watch: program.watch || false,
      files: filePath?.length ? filePath : undefined,
      prevFormat,
    })
  }

  const changedPaths = new Set<string>()
  let debounceTimer: NodeJS.Timer
  const dispatchExtract = (filePath?: string[]) => {
    // Skip debouncing if not enabled
    if (!program.debounce) return extract(filePath)

    filePath?.forEach((path) => changedPaths.add(path))

    // CLear the previous timer if there is any, and schedule the next
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const filePath = [...changedPaths]
      changedPaths.clear()

      await extract(filePath)
    }, program.debounce)
  }

  // Check if Watch Mode is enabled
  if (program.watch) {
    console.info(chalk.bold("Initializing Watch Mode..."))

    const catalogs = getCatalogs(config)
    let paths = []
    let ignored = []

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
  } else if (program.args) {
    // this behaviour occurs when we extract files by his name
    // for ex: lingui extract src/app, this will extract only files included in src/app
    extract(program.args).then(result => {
      if (!result) process.exit(1)
    })
  } else {
    extract().then(result => {
      if (!result) process.exit(1)
    })
  }
}
