#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const emojify = require('node-emoji').emojify
const program = require('commander')
const transformFileSync = require('babel-core').transformFileSync
const getConfig = require('lingui-conf').default

const config = getConfig()

function processFiles(files) {
  files.forEach(file => {
    if (!fs.existsSync(file)) return

    if (fs.lstatSync(file).isDirectory()) {
      const ignored = config.srcPathIgnorePatterns.filter(pattern => (new RegExp(pattern)).test(file))
      if (ignored.length) return

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

function readMessagesDirectory(dir) {
  const catalog = {}

  fs.readdirSync(dir)
    .map(filename => path.join(dir, filename))
    .forEach(filename => {
      let messages = {}
      if (fs.lstatSync(filename).isDirectory()) {
        messages = readMessagesDirectory(filename)
      } else {
        messages = JSON.parse(fs.readFileSync(filename))
      }
      Object.assign(catalog, messages)
    })

  return catalog
}

function generateMessageCatalog(localeDir) {
  const buildDir = path.join(localeDir, '_build')
  const catalog = readMessagesDirectory(buildDir)

  const languages = fs.readdirSync(localeDir).filter(dirname =>
    /^([a-z-]+)$/i.test(dirname) &&
    fs.lstatSync(path.join(localeDir, dirname)).isDirectory()
  )

  languages.forEach(language =>
    writeLanguageFile(
      language,
      catalog,
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
processFiles(program.args.length ? program.args : config.srcPathDirs)
console.log()

console.log(emojify(':book:  Generating message catalogues:'))
generateMessageCatalog(config.localeDir)
console.log()

console.log(emojify(':sparkles:  Done!'))
