// @flow
import fs from "fs"
import path from "path"
import mkdirp from "mkdirp"
import chalk from "chalk"
import program from "commander"

import { getConfig } from "@lingui/conf"

import type { LinguiConfig, CatalogFormat } from "./api/formats/types"
import { extract, collect, cleanObsolete, order } from "./api/extract"
import { printStats } from "./api/stats"
import { removeDirectory } from "./api/utils"

type ExtractOptions = {|
  verbose: boolean,
  clean: boolean,
  overwrite: boolean,
  prevFormat: ?CatalogFormat,
  babelOptions: Object
|}

export default function command(
  config: LinguiConfig,
  format: CatalogFormat,
  options: ExtractOptions
): boolean {
  const convertFormat = options.prevFormat || format
  const locales = convertFormat.getLocales()

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

  console.log("Extracting messages from source files…")
  extract(config.srcPathDirs, config.localeDir, {
    ignore: config.srcPathIgnorePatterns,
    verbose: options.verbose,
    babelOptions: options.babelOptions
  })
  options.verbose && console.log()

  console.log("Collecting all messages…")
  const clean = options.clean ? cleanObsolete : id => id

  let catalog
  try {
    catalog = collect(buildDir)
  } catch (e) {
    console.error(e)
    return false
  }

  const prevCatalogs = convertFormat.readAll()
  const catalogs = order(
    clean(
      convertFormat.merge(prevCatalogs, catalog, {
        overwrite: options.overwrite
      })
    )
  )
  options.verbose && console.log()

  console.log("Writing message catalogues…")
  locales
    .map(locale => format.write(locale, catalogs[locale]))
    .forEach(([created, filename]) => {
      if (!filename || !options.verbose) return

      if (created) {
        console.log(chalk.green(`Created ${filename}`))
      } else {
        console.log(chalk.green(`Updated ${filename}`))
      }
    })
  options.verbose && console.log()

  console.log("Messages extracted!\n")

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
  const formatName = program.format || config.format
  const prevFormatName = program.convertFrom

  if (prevFormatName && formatName === prevFormatName) {
    console.log(
      chalk.red("Trying to migrate message catalog to the same format")
    )
    console.log(
      `Set ${chalk.bold("new")} format in lingui configuration or using` +
        ` --format option\nand ${chalk.bold("previous")} format using` +
        ` --convert-format option.`
    )
    console.log()
    console.log(`Example: Convert from lingui format to minimal`)
    console.log(
      chalk.yellow(`lingui extract --format minimal --convert-from lingui`)
    )
    process.exit(1)
  }

  const format = require(`./api/formats/${formatName}`).default(config)
  const prevFormat = prevFormatName
    ? require(`./api/formats/${prevFormatName}`).default(config)
    : null

  const result = command(config, format, {
    verbose: program.verbose || false,
    clean: program.clean || false,
    overwrite: program.overwrite || false,
    babelOptions: program.babelOptions || {},
    prevFormat
  })

  if (!result) process.exit(1)
}
