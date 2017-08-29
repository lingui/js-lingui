// @flow
import chalk from 'chalk'
import program from 'commander'
import getConfig from 'lingui-conf'

import type { CatalogFormat } from './api/formats/types'

export default function command (format: CatalogFormat, locales: Array<string>) {
  const results = locales.map(locale => {
    const [created, filename] = format.addLocale(locale)

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
    console.log(`(use "${chalk.yellow('lingui extract')}" to extract messages)`)
  }
}

if (require.main === module) {
  program
    .description(
      'Add target locales. Remove locale by removing <locale> ' +
      'directory from your localeDir (e.g. ./locale/en)')
    .arguments('<locale...>')
    .option('--format <format>', 'Format of message catalog')
    .on('--help', function () {
      console.log('\n  Examples:\n')
      console.log('    # Add single locale')
      console.log('    $ lingui add-locale en')
      console.log('')
      console.log('    # Add multiple locales')
      console.log('    $ lingui add-locale en es fr ru')
    })
    .parse(process.argv)

  if (!program.args.length) program.help()

  const config = getConfig()
  const formatName = program.format || config.format
  const format = require(`./api/formats/${formatName}`).default(config)

  command(format, program.args)
}
