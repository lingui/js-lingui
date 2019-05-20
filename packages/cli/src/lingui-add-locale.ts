import chalk from "chalk"

if (require.main === module) {
  const msg =
    "lingui add-locale command is deprecated. " +
    `Please set ${chalk.yellow("'locales'")} in configuration. ` +
    chalk.underline("https://lingui.js.org/ref/conf.html#locales")
  console.error(msg)
}
