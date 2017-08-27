// @flow
import path from 'path'
import chalk from 'chalk'
import program from 'commander'

import getConfig from 'lingui-conf'

import type { LinguiConfig, CatalogFormat } from './api/formats/types'
import { extract, collect, cleanObsolete } from './api/extract'
import { printStats } from './api/stats'

type ExtractOptions = {|
  verbose: boolean,
  clean: boolean
|}

export default function command (
  config: LinguiConfig,
  format: CatalogFormat,
  options: ExtractOptions
): boolean {
  const locales = format.getLocales()

  if (!locales.length) {
    console.log('No locales defined!\n')
    console.log(`(use "${chalk.yellow('lingui add-locale <language>')}" to add one)`)
    return false
  }

  console.log('Extracting messages from source files…')
  extract(
    config.srcPathDirs,
    config.localeDir,
    {
      ignore: config.srcPathIgnorePatterns,
      verbose: options.verbose
    }
  )
  options.verbose && console.log()

  console.log('Collecting all messages…')
  const clean = options.clean ? cleanObsolete : id => id
  const buildDir = path.join(config.localeDir, '_build')
  const catalog = collect(buildDir)
  const catalogs = clean(format.merge(catalog))
  options.verbose && console.log()

  console.log('Writing message catalogues…')
  locales
    .map(locale => format.write(locale, catalogs[locale]))
    .forEach(([created, filename]) => {
      if (!filename || !options.verbose) return

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
  program
    .option('--verbose', 'Verbose output')
    .option('--clean', 'Remove obsolete translations')
    .option('--format <format>', 'Format of message catalog')
    .parse(process.argv)

  const config = getConfig()
  const formatName = program.format || config.format
  const format = require(`./api/formats/${formatName}`).default(config)

  const result = command(config, format, {
    verbose: program.verbose || false,
    clean: program.clean || false
  })

  if (!result) process.exit(1)
}
