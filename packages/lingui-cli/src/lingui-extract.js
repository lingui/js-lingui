#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify
const program = require('commander')
const transformFileSync = require('babel-core').transformFileSync

function processFiles(files) {
  files.forEach(file => {
    if (!fs.existsSync(file)) return

    if (fs.lstatSync(file).isDirectory()) {
      if(/node_modules/i.test(file)) return

      processFiles(
        fs.readdirSync(file).map(filename => path.join(file, filename))
      )
    } else {
      if(!/\.jsx?$/i.test(file)) return
      transformFileSync(file)
      console.log(chalk.green(file))
    }
  })
}

function generateMessageCatalog(localeDir) {
  const messages = {}

  const buildDir = path.join(localeDir, '_build')

  fs.readdirSync(buildDir)
    .map(filename => path.join(buildDir, filename))
    .forEach(filename => {
      const file = JSON.parse(fs.readFileSync(filename))
      Object.assign(messages, file)
    })

  const languages = fs.readdirSync(localeDir).filter(dirname =>
    /^([a-z-]+)$/i.test(dirname) &&
    fs.lstatSync(path.join(localeDir, dirname)).isDirectory()
  )

  languages.forEach(language =>
    writeLanguageFile(
      language,
      messages,
      localeDir
    )
  )
}

function JSONWriter(messages) {
  const catalog = {}
  Object.keys(messages).forEach(key => catalog[key] = '')

  return {
    catalog: JSON.stringify(catalog, null, 2),
    filename: 'messages.json'
  }
}

function writeLanguageFile(language, messages, localeDir) {
  const { catalog, filename } = JSONWriter(messages)

  const messageFile = path.join(localeDir, language, filename)
  fs.writeFileSync(messageFile, catalog)

  console.log(chalk.green(messageFile))
}


program.parse(process.argv)

console.log(emojify(':mag:  Extracting messages from source files:'))
processFiles(program.args.length ? program.args : ['.'])
console.log()

console.log(emojify(':book:  Generating message catalogues:'))
generateMessageCatalog('locale')
console.log()

console.log(emojify(':sparkles:  Done!'))
