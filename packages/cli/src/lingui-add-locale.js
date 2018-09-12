// @flow
import chalk from "chalk"
import program from "commander"

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

  const msg =
    "lingui add-locale command is deprecated. " +
    `Please set ${chalk.yellow("'locales'")} in configuration. ` +
    chalk.underline("https://lingui.js.org/ref/conf.html#locales")
  console.warn(msg)
}
