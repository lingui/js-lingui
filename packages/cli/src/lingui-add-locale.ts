import chalk from "chalk"
import program from "commander"
import { getConfig } from "@lingui/conf"

import configureCatalog from "./api/catalog"
import { LinguiConfig } from "./api/types"

export default function command(config: LinguiConfig, locales: Array<string>) {
  const catalog = configureCatalog(config)

  const results = locales.map(locale => {
    const [created, filename] = catalog.addLocale(locale)

    if (!filename) {
      console.log(chalk.red(`Unknown locale: ${chalk.bold(locale)}.`))
      return false
    } else if (created) {
      console.log(chalk.green(`Added locale ${chalk.bold(locale)}.`))
    } else {
      console.log(chalk.yellow(`Locale ${chalk.bold(locale)} already exists.`))
    }

    return true
  })

  // At least one language was added successfully
  if (results.filter(Boolean).length) {
    console.log()
    console.log(`(use "${chalk.yellow("lingui extract")}" to extract messages)`)
  }
}

if (require.main === module) {
  program
    .description(
      "Add target locales. Remove locale by removing <locale> " +
        "directory from your localeDir (e.g. ./locale/en)"
    )
    .arguments("<locale...>")
    .option("--format <format>", "Format of message catalog")
    .on("--help", function() {
      console.log("\n  Examples:\n")
      console.log("    # Add single locale")
      console.log("    $ lingui add-locale en")
      console.log("")
      console.log("    # Add multiple locales")
      console.log("    $ lingui add-locale en es fr ru")
    })
    .parse(process.argv)

  if (!program.args.length) program.help()

  const config = getConfig()
  if (program.format) {
    const msg =
      "--format option is deprecated and will be removed in @lingui/cli@3.0.0." +
      " Please set format in configuration https://lingui.js.org/ref/conf.html#format"
    console.warn(msg)
    config.format = program.format
  }

  command(config, program.args)
}
