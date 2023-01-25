import chalk from "chalk"

if (require.main === module) {
  const msg =
    "lingui add-locale command is deprecated. " +
    `Please set ${chalk.yellow("'locales'")} in configuration. ` +
    chalk.underline("https://lingui.dev/ref/conf#locales")
  console.error(msg)
}
