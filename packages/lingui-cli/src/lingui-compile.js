// @flow
import chalk from 'chalk'
import R from 'ramda'
import program from 'commander'
import plurals from 'make-plural'

import * as t from 'babel-types'
import { parseExpression } from 'babylon'
import generate from 'babel-generator'

import getConfig from 'lingui-conf'

import { compile } from './api/compile'

function command (config, format, { allowEmpty }) {
  const locales = format.getLocales()
  console.log('Compiling message catalogs…')

  const catalogs = R.mergeAll(
    locales.map((locale) => ({ [locale]: format.read(locale) }))
  )

  return locales.map(locale => {
    const [language] = locale.split('_')
    const pluralRules = plurals[language]
    if (!pluralRules) {
      console.log(chalk.red(`Error: Invalid locale ${chalk.bold(locale)} (missing plural rules)!`))
      console.log()
      return false
    }

    const messages = R.mergeAll(
      Object.keys(catalogs[locale]).map(key => ({
        [key]: format.getTranslation(catalogs, locale, key, {
          fallbackLanguage: config.fallbackLanguage,
          allowEmpty
        })
      }))
    )

    if (!allowEmpty) {
      const missing = R.keys(messages).filter(
        key => messages[key] === undefined
      )

      if (missing.length) {
        console.log(chalk.red(`Error: Failed to compile catalog for locale ${chalk.bold(locale)}!`))
        console.log(chalk.red('Missing translations:'))
        missing.forEach(({ key }) => console.log(key))
        console.log()
        return false
      }
    }

    const compiledMessages = R.keys(messages).map(key => {
      const translation = messages[key]
      return t.objectProperty(
        t.stringLiteral(key),
        translation ? compile(translation) : t.stringLiteral('')
      )
    })

    const languageData = [
      t.objectProperty(
        t.stringLiteral('p'),
        parseExpression(pluralRules.toString())
      )
    ]

    const compiled = t.expressionStatement(t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('module'), t.identifier('exports')),
      t.objectExpression([
        // language data
        t.objectProperty(
          t.identifier('l'),
          t.objectExpression(languageData)
        ),
        // messages
        t.objectProperty(
          t.identifier('m'),
          t.objectExpression(compiledMessages)
        )
      ])
    ))

    const compiledPath = format.writeCompiled(
      locale,
      generate(compiled, {
        minified: true
      }).code
    )

    console.log(chalk.green(`${locale} ⇒ ${compiledPath}`))
    return compiledPath
  })
}

if (require.main === module) {
  const config = getConfig()
  const format = require(`./api/formats/${config.format}`).default(config)

  program
    .description('Add compile message catalogs and add language data (plurals) to compiled bundle.')
    .option('--strict', 'Disable defaults for missing translations')
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

  const results = command(config, format, {
    allowEmpty: program.strict !== true
  })

  if (results.some(res => !res)) {
    process.exit(1)
  }

  console.log('Done!')
}
