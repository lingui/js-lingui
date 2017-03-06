const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify
const program = require('commander')
const getConfig = require('lingui-conf').default

const t = require('babel-types')
const generate = require('babel-generator').default
const compile = require('./api/compile').default

function compileCatalogs (localeDir) {
  const languages = fs.readdirSync(localeDir).filter(dirname =>
    /^([a-z-]+)$/i.test(dirname) &&
    fs.lstatSync(path.join(localeDir, dirname)).isDirectory()
  )

  languages.forEach(locale => {
    const sourcePath = path.join(localeDir, locale, 'messages.json')
    const compiledPath = path.join(localeDir, locale, 'messages.js')
    console.log(chalk.green(sourcePath))

    const messages = []
    const source = JSON.parse(fs.readFileSync(sourcePath))
    Object.keys(source).forEach(key => {
      messages.push(t.objectProperty(
        t.stringLiteral(key),
        compile(source[key])
      ))
    })

    const compiled = t.expressionStatement(t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('module'), t.identifier('exports')),
      t.objectExpression([t.objectProperty(
        t.identifier('m'),
        t.objectExpression(messages)
      )])
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
