// @flow
import chalk from "chalk"
import program from "commander"

import { getConfig } from "@lingui/conf"
import type { LinguiConfig } from "@lingui/conf"

import { getCatalogs } from "./api/catalog"
import type { CatalogApi } from "./api/types"
import { printStats } from "./api/stats"
import { detect } from "./api/detect"

export type CliExtractOptions = {
  verbose: boolean,
  clean: boolean,
  overwrite: boolean,
  prevFormat: ?CatalogApi
}

export default function command(
  config: LinguiConfig,
  options: CliExtractOptions
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

  options.verbose && console.error("Extracting messages from source files…")
  const catalogs = getCatalogs(config)
  catalogs.forEach(catalog => {
    catalog.make({
      ...options,
      projectType: detect()
    })
  })

  // console.log("Catalog statistics:")
  // printStats(config, catalogs)
  // console.log()

  console.error(
    `(use "${chalk.yellow(
      "lingui extract"
    )}" to update catalogs with new messages)`
  )
  console.error(
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
    .option("--verbose", "Verbose output")
    .option(
      "--convert-from <format>",
      "Convert from previous format of message catalogs"
    )
    // Obsolete options
    .option(
      "--babelOptions",
      "Babel options passed to transform/extract plugins"
    )
    .option("--format <format>", "Format of message catalogs")
    .parse(process.argv)

  const config = getConfig()

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
    console.error()
    console.error(`Example - Convert from JSON to PO:`)
    console.error(`lingui extract --convert-from json`)
    console.error()
  }

  if (hasErrors) process.exit(1)

  const result = command(config, {
    verbose: program.verbose || false,
    clean: program.clean || false,
    overwrite: program.overwrite || false,
    prevFormat
  })

  if (!result) process.exit(1)
}
