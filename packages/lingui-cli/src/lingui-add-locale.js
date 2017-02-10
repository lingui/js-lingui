const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify
const program = require('commander')
const getConfig = require('lingui-conf').default

const config = getConfig()

program.parse(process.argv)

function addLocale (locales) {
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

console.log(emojify(':white_check_mark:  Adding locales:'))
addLocale(program.args)
console.log()

console.log(emojify(':sparkles:  Done!'))
