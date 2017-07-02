const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify
const program = require('commander')
const plurals = require('make-plural')
const babylon = require('babylon')
const getConfig = require('lingui-conf').default

const t = require('babel-types')
const generate = require('babel-generator').default
const compile = require('./api/compile').default

function getTranslation (catalog, locale, key) {
  const fallbackLanguage = config.fallbackLanguage

  const fallback = fallbackLanguage === '' ? key : catalog[fallbackLanguage][key]
  return catalog[locale][key] || fallback
}

function compileCatalogs (localeDir) {
  const languages = fs.readdirSync(localeDir).filter(dirname =>
    /^([a-z-]+)$/i.test(dirname) &&
    fs.lstatSync(path.join(localeDir, dirname)).isDirectory()
  )

  const catalog = languages.reduce((dict, locale) => {
    const sourcePath = path.join(localeDir, locale, 'messages.json')
    dict[locale] = JSON.parse(fs.readFileSync(sourcePath))
    return dict
  }, {})

  languages.forEach(locale => {
    const compiledPath = path.join(localeDir, locale, 'messages.js')
    const sourcePath = path.join(localeDir, locale, 'messages.json')
    console.log(chalk.green(sourcePath))

    const messages = []
    const source = catalog[locale]
    Object.keys(source).forEach(key => {
      messages.push(t.objectProperty(
        t.stringLiteral(key),
        compile(getTranslation(catalog, locale, key))
      ))
    })

    const languageData = [
    ]
    const pluralRules = plurals[locale]
    if (!pluralRules) {
      throw new Error(`Missing plural rules for locale ${locale}`)
    }
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
        t.objectProperty(
          t.identifier('l'),
          t.objectExpression(languageData)
        ),
        t.objectProperty(
          t.identifier('m'),
          t.objectExpression(messages)
        )
      ])
    ))

    fs.writeFileSync(compiledPath, generate(compiled, {
      minified: true
    }).code)
  })
}

const config = getConfig()

program.parse(process.argv)

console.log(emojify(':compression:  Compiling message catalogs:'))
compileCatalogs(config.localeDir)
console.log()

console.log(emojify(':sparkles:  Done!'))
