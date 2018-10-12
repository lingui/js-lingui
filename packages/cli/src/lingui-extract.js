// @flow
import chalk from "chalk"
import program from "commander"

import { getConfig } from "@lingui/conf"
import type { LinguiConfig } from "@lingui/conf"

import { getCatalogs } from "./api/ngCatalog"
import type { CatalogApi } from "./api/types"
import { printStats } from "./api/stats"
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

  options.verbose && console.log("Extracting messages from source files…")
  const catalogs = getCatalogs(config)
  catalogs.forEach(catalog => {
    catalog.make({
      ...options,
      projectType: detect()
    })
  })

  // console.log("Catalog statistics:")
  // printStats(config, catalogs)
  console.log()

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
