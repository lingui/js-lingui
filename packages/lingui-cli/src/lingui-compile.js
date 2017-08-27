const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const program = require('commander')
const plurals = require('make-plural')
const babylon = require('babylon')
const getConfig = require('lingui-conf').default

const t = require('babel-types')
const generate = require('babel-generator').default
const { getLanguages } = require('./api/languages')
const compile = require('./api/compile').default

function getOrDefault (message, allowEmpty = true) {
  if (!allowEmpty) return message.translation

  return message.translation || message.defaults || ''
}

function getTranslation (catalog, locale, key, allowEmpty) {
  const translation = getOrDefault(catalog[locale][key], allowEmpty)

  const fallbackLanguage = config.fallbackLanguage
  if (!translation && fallbackLanguage) {
    return getOrDefault(catalog[fallbackLanguage][key], allowEmpty)
  }

  return translation
}

function compileCatalogs (localeDir, { allowEmpty }) {
  const languages = getLanguages(localeDir)

  console.log(`Compiling message catalogs for locales: ${languages.join(', ')}`)

  const catalog = languages.reduce((dict, locale) => {
    const sourcePath = path.join(localeDir, locale, 'messages.json')
    dict[locale] = JSON.parse(fs.readFileSync(sourcePath))
    return dict
  }, {})

  const results = languages.map(locale => {
    const compiledPath = path.join(localeDir, locale, 'messages.js')
    const sourcePath = path.join(localeDir, locale, 'messages.json')

    const messages = []
    const source = catalog[locale]

    const translations = Object.keys(source).map(key => ({
      key,
      translation: getTranslation(catalog, locale, key, allowEmpty)
    }))

    if (!allowEmpty) {
      const missing = translations.filter(
        ({ translation }) => translation === undefined
      )

      if (missing.length) {
        console.log(chalk.red(`Error: Failed to compile catalog for locale ${chalk.bold(locale)}!`))
        console.log(chalk.red('Missing translations:'))
        missing.forEach(({ key }) => console.log(key))
        console.log()
        return false
      }
    }

    const languageData = []
    const [ language ] = locale.split('_')
    const pluralRules = plurals[language]
    if (!pluralRules) {
      console.log(chalk.red(`Error: Invalid locale ${chalk.bold(locale)} (missing plural rules)!`))
      console.log()
      return false
    }

    console.log(chalk.green(`${locale} ⇒ ${sourcePath}`))

    Object.keys(source).forEach(key => {
      messages.push(t.objectProperty(
        t.stringLiteral(key),
        compile(getTranslation(catalog, locale, key))
      ))
    })

    languageData.push(
      t.objectProperty(
        t.stringLiteral('p'),
        babylon.parseExpression(pluralRules.toString())
      )
    )

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
          t.objectExpression(messages)
        )
      ])
    ))

    fs.writeFileSync(compiledPath, generate(compiled, {
      minified: true
    }).code)

    return true
  })

  if (results.filter(res => !res).length) {
    process.exit(1)
  }
}

const config = getConfig()

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

compileCatalogs(config.localeDir, {
  allowEmpty: program.strict !== true
})
console.log()
