// @flow
import path from 'path'
import chalk from 'chalk'
import program from 'commander'

import getConfig from 'lingui-conf'

import { extract, collect } from './api/extract'
import { printStats } from './api/stats'

export default function command (config, format, options): boolean {
  const locales = format.getLocales()

  if (!locales.length) {
    console.log('No locales defined.')
    console.log(`(use "${chalk.yellow('lingui add-locale <language>')}" to add one)`)
    return false
  }

  console.log('Extracting messages from source files…')
  extract(
    config.srcPathDirs,
    {
      localeDir: config.localeDir,
      ignore: config.srcPathIgnorePatterns,
      verbose: options.verbose
    }
  )
  options.verbose && console.log()

  console.log('Collecting all messages…')
  const buildDir = path.join(config.localeDir, '_build')
  const catalog = collect(buildDir)
  const catalogs = format.merge(catalog)
  options.verbose && console.log()

  console.log('Writing message catalogues…')
  locales
    .map(locale => format.write(locale, catalogs[locale]))
    .forEach(([created, filename]) => {
      if (!options.verbose) return

      if (created) {
        console.log(chalk.green(`Created ${filename}`))
      } else {
        console.log(chalk.green(`Updated ${filename}`))
      }
    })
  options.verbose && console.log()

  console.log('Messages extracted!\n')

  console.log('Catalog statistics:')
  printStats(catalogs)
  console.log()

  console.log(`(use "${chalk.yellow('lingui extract')}" to update catalogs with new messages)`)
  console.log(`(use "${chalk.yellow('lingui compile')}" to compile catalogs for production)`)
  return true
}

if (require.main === module) {
  const config = getConfig()
  const format = require(`./api/formats/${config.format}`).default(config)

  program
    .option('--verbose', 'Verbose output')
    .parse(process.argv)

  const result = command(config, format, {
    verbose: program.verbose || false
  })

  if (!result) process.exit(1)
}
