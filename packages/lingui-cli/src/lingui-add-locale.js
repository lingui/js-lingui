const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const program = require('commander')
const getConfig = require('lingui-conf').default
const plurals = require('make-plural')

const config = getConfig()

program.parse(process.argv)

function validateLocales (locales) {
  const unknown = locales.filter(locale => !(locale in plurals))
  if (unknown.length) {
    console.log(chalk.red(`Unknown locale(s): ${unknown.join(', ')}.`))
    process.exit(1)
  }
}

function addLocale (locales) {
  if (fs.existsSync(config.localeDir)) {
    fs.mkdirSync(config.localeDir)
  }

  locales.forEach(locale => {
    const localeDir = path.join(config.localeDir, locale)

    if (fs.existsSync(localeDir)) {
      console.log(chalk.yellow(`Locale ${chalk.underline(locale)} already exists.`))
    } else {
      fs.mkdirSync(localeDir)
      console.log(chalk.green(`Added locale ${chalk.underline(locale)}.`))
    }
  })
}

validateLocales(program.args)

addLocale(program.args)
console.log()
console.log(`(use "${chalk.yellow('lingui extract')}" to extract messages)`)
