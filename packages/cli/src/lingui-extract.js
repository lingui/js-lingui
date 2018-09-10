// @flow
import fs from "fs"
import path from "path"
import mkdirp from "mkdirp"
import chalk from "chalk"
import program from "commander"

import { getConfig } from "@lingui/conf"

import configureCatalog from "./api/catalog"

import type { LinguiConfig, CatalogApi } from "./api/types"
import { extract, collect, cleanObsolete, order } from "./api/extract"
import { printStats } from "./api/stats"
import { removeDirectory } from "./api/utils"
import { detect } from "./api/detect"

type ExtractOptions = {|
  verbose: boolean,
  clean: boolean,
  overwrite: boolean,
  prevFormat: ?CatalogApi,
  babelOptions: Object
|}

export default function command(
  config: LinguiConfig,
  options: ExtractOptions
): boolean {
  // `react-app` babel plugin used by CRA requires either BABEL_ENV or NODE_ENV to be
  // set. We're setting it here, because lingui macros are going to use them as well.
  if (!process.env.BABEL_ENV && !process.env.NODE_ENV) {
    process.env.BABEL_ENV = "development"
  }

  // We need macros to keep imports, so extract-messages plugin know what componets
  // to collect. Users usually use both BABEN_ENV and NODE_ENV, so it's probably
  // save to introduce a new env variable. LINGUI_EXTRACT=1 during `lingui extract`
  process.env.LINGUI_EXTRACT = "1"

  const catalog = configureCatalog(config)
  const pseudoLocale = config.pseudoLocale
  if (pseudoLocale) {
    catalog.addLocale(pseudoLocale)
  }

  const locales = catalog.getLocales()

  if (!locales.length) {
    console.log("No locales defined!\n")
    console.log(
      `(use "${chalk.yellow("lingui add-locale <language>")}" to add one)`
    )
    return false
  }

  const buildDir = path.join(config.localeDir, "_build")
  if (fs.existsSync(buildDir)) {
    // remove only the content of build dir, not the directory itself
    removeDirectory(buildDir, true)
  } else {
    mkdirp(buildDir)
  }

  const projectType = detect()

  options.verbose && console.log("Extracting messages from source files…")
  extract(config.srcPathDirs, config.localeDir, {
    projectType,
    ignore: config.srcPathIgnorePatterns,
    verbose: options.verbose,
    babelOptions: options.babelOptions
  })
  options.verbose && console.log()

  options.verbose && console.log("Collecting messages…")
  const clean = options.clean ? cleanObsolete : id => id

  let nextCatalog
  try {
    nextCatalog = collect(buildDir)
  } catch (e) {
    console.error(e)
    return false
  }

  const prevCatalogs = catalog.readAll()
  const catalogs = order(
    clean(
      catalog.merge(prevCatalogs, nextCatalog, {
        overwrite: options.overwrite
      })
    )
  )
  options.verbose && console.log()

  options.verbose && console.log("Writing message catalogues…")
  locales
    .map(locale => catalog.write(locale, catalogs[locale]))
    .forEach(([created, filename]) => {
      if (!filename || !options.verbose) return

      if (created) {
        console.log(chalk.green(`Created ${filename}`))
      } else {
        console.log(chalk.green(`Updated ${filename}`))
      }
    })
  options.verbose && console.log()
  options.verbose && console.log("Messages extracted!\n")

  console.log("Catalog statistics:")
  printStats(config, catalogs)
  console.log()

  console.log(
    `(use "${chalk.yellow(
      "lingui add-locale <language>"
    )}" to add more locales)`
  )
  console.log(
    `(use "${chalk.yellow(
      "lingui extract"
    )}" to update catalogs with new messages)`
  )
  console.log(
    `(use "${chalk.yellow(
      "lingui compile"
    )}" to compile catalogs for production)`
  )
  return true
}

if (require.main === module) {
  program
    .option("--overwrite", "Overwrite translations for source locale")
    .option("--clean", "Remove obsolete translations")
    .option(
      "--babelOptions",
      "Babel options passed to transform/extract plugins"
    )
    .option("--verbose", "Verbose output")
    .option("--format <format>", "Format of message catalogs")
    .option(
      "--convert-from <format>",
      "Convert from previous format of message catalogs"
    )
    .parse(process.argv)

  const config = getConfig()

  if (program.format) {
    const msg =
      "--format option is deprecated and will be removed in @lingui/cli@3.0.0." +
      " Please set format in configuration https://lingui.js.org/ref/conf.html#format"
    console.warn(msg)
    config.format = program.format
  }

  if (program.babelOptions) {
    const msg =
      "--babelOptions option is deprecated and will be removed in @lingui/cli@3.0.0." +
      " Please set extractBabelOptions in configuration https://lingui.js.org/ref/conf.html#extractBabelOptions"
    console.warn(msg)
  }

  const prevFormat = program.convertFrom
  if (prevFormat && config.format === prevFormat) {
    console.log(
      chalk.red("Trying to migrate message catalog to the same format")
    )
    console.log(
      `Set ${chalk.bold("new")} format in lingui configuration\n` +
        ` and ${chalk.bold("previous")} format using --convert-format option.`
    )
    console.log()
    console.log(`Example: Convert from lingui format to minimal`)
    console.log(
      chalk.yellow(`lingui extract --format minimal --convert-from lingui`)
    )
    process.exit(1)
  }

  const result = command(config, {
    verbose: program.verbose || false,
    clean: program.clean || false,
    overwrite: program.overwrite || false,
    babelOptions: config.extractBabelOptions || program.babelOptions || {},
    prevFormat
  })

  if (!result) process.exit(1)
}
