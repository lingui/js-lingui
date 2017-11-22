// @flow
import chalk from 'chalk'
import R from 'ramda'
import program from 'commander'
import plurals from 'make-plural'

import getConfig from 'lingui-conf'

import { createCompiledCatalog } from './api/compile'

function command (config, format, options) {
  const locales = format.getLocales()

  if (!locales.length) {
    console.log('No locales defined!\n')
    console.log(`(use "${chalk.yellow('lingui add-locale <language>')}" to add one)`)
    return false
  }

  const catalogs = R.mergeAll(
    locales.map((locale) => ({ [locale]: format.read(locale) }))
  )

  const noMessages = R.compose(R.all(R.equals(true)), R.values, R.map(R.isEmpty))
  if (noMessages(catalogs)) {
    console.log('Nothing to compile, message catalogs are empty!\n')
    console.log(`(use "${chalk.yellow('lingui extract')}" to extract messages from source files)`)
    return false
  }

  console.log('Compiling message catalogs…')

  return locales.map(locale => {
    const [language] = locale.split('_')
    if (!plurals[language]) {
      console.log(chalk.red(`Error: Invalid locale ${chalk.bold(locale)} (missing plural rules)!`))
      console.log()
      return false
    }

    const messages = R.mergeAll(
      Object.keys(catalogs[locale]).map(key => ({
        [key]: format.getTranslation(catalogs, locale, key, {
          fallbackLocale: config.fallbackLocale,
          sourceLocale: config.sourceLocale
        })
      }))
    )

    if (!options.allowEmpty && config.sourceLocale !== locale) {
      const missing = R.keys(messages).filter(
        key => messages[key] === undefined
      )

      if (missing.length) {
        console.log(chalk.red(`Error: Failed to compile catalog for locale ${chalk.bold(locale)}!`))

        if (options.verbose) {
          console.log(chalk.red('Missing translations:'))
          missing.forEach(msgId => console.log(msgId))
        } else {
          console.log(chalk.red(`Missing ${missing.length} translation(s)`))
        }
        console.log()
        return false
      }
    }

    const compiledCatalog = createCompiledCatalog(locale, messages)
    const compiledPath = format.writeCompiled(locale, compiledCatalog)

    options.verbose && console.log(chalk.green(`${locale} ⇒ ${compiledPath}`))
    return compiledPath
  })
}

if (require.main === module) {
  program
    .description('Add compile message catalogs and add language data (plurals) to compiled bundle.')
    .option('--strict', 'Disable defaults for missing translations')
    .option('--verbose', 'Verbose output')
    .option('--format <format>', 'Format of message catalog')
    .on('--help', function () {
      console.log('\n  Examples:\n')
      console.log('    # Compile translations and use defaults or message IDs for missing translations')
      console.log('    $ lingui compile')
      console.log('')
      console.log('    # Compile translations but fail when there\'re missing')
      console.log('    # translations (don\'t replace missing translations with')
      console.log('    # default messages or message IDs)')
      console.log('    $ lingui compile --strict')
    })
    .parse(process.argv)

  const config = getConfig()
  const formatName = program.format || config.format
  const format = require(`./api/formats/${formatName}`).default(config)

  const results = command(config, format, {
    verbose: program.verbose || false,
    allowEmpty: !program.strict
  })

  if (!results || results.some(res => !res)) {
    process.exit(1)
  }

  console.log('Done!')
}
