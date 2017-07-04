import linguiTransformJs from 'babel-plugin-lingui-transform-js'
import linguiTransformReact from 'babel-plugin-lingui-transform-react'
import linguiExtractMessages from 'babel-plugin-lingui-extract-messages'
import getConfig from 'lingui-conf'

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const Table = require('cli-table')
const emojify = require('node-emoji').emojify
const program = require('commander')
const transformFileSync = require('babel-core').transformFileSync

const { getLanguages } = require('./api/languages')

const config = getConfig()

function extractMessages (files) {
  files.forEach(file => {
    if (!fs.existsSync(file)) return

    if (fs.lstatSync(file).isDirectory()) {
      const ignored = config.srcPathIgnorePatterns.filter(pattern => (new RegExp(pattern)).test(file))
      if (ignored.length) return

      extractMessages(
        fs.readdirSync(file).map(filename => path.join(file, filename))
      )
    } else {
      if (!/\.jsx?$/i.test(file)) return
      transformFileSync(file, {
        plugins: [
          // Plugins run before presets, so we need to import trasnform-plugins
          // here until we have a better way to run extract-messages plugin
          // *after* all plugins/presets.
          // Transform plugins are idempotent, so they can run twice.
          linguiTransformJs,
          linguiTransformReact,
          linguiExtractMessages
        ]
      })
      console.log(chalk.green(file))
    }
  })
}

function collectMessages (dir) {
  const catalog = {}

  fs.readdirSync(dir)
    .map(filename => path.join(dir, filename))
    .forEach(filename => {
      let messages = {}
      if (fs.lstatSync(filename).isDirectory()) {
        messages = collectMessages(filename)
      } else {
        messages = JSON.parse(fs.readFileSync(filename))
      }
      Object.assign(catalog, messages)
    })

  return catalog
}

function writeCatalogs (localeDir, languages) {
  const buildDir = path.join(localeDir, '_build')
  const catalog = collectMessages(buildDir)

  return languages.map(
    language => JSONWriter(catalog, path.join(localeDir, language))
  )
}

function JSONWriter (messages, languageDir) {
  let newFile = true

  const catalog = {}
  Object.keys(messages).forEach(key => {
    catalog[key] = messages[key].defaults || ''
  })

  const catalogFilename = path.join(languageDir, 'messages.json')

  if (fs.existsSync(catalogFilename)) {
    const original = JSON.parse(fs.readFileSync(catalogFilename))

    Object.keys(original).forEach(key => {
      if (original[key]) catalog[key] = original[key]
    })

    newFile = false
  }

  const content = JSON.stringify(catalog, null, 2)
  fs.writeFileSync(catalogFilename, content)

  if (newFile) {
    console.log(chalk.green(`Merging ${catalogFilename}`))
  } else {
    console.log(chalk.yellow(`Writing ${catalogFilename}`))
  }

  return getStats(catalog)
}

function getStats (catalog) {
  return [
    Object.keys(catalog).length,
    Object.keys(catalog).map(key => catalog[key]).filter(msg => !msg).length
  ]
}

function displayStats (languages, stats) {
  const table = new Table({
    head: ['Language', 'Total count', 'Missing'],
    colAligns: ['left', 'middle', 'middle'],
    style: {
      head: ['green'],
      border: [],
      compact: true
    }
  })

  languages.forEach(
    (language, index) => table.push({[language]: stats[index]})
  )

  console.log(table.toString())
}

program.parse(process.argv)

const languages = getLanguages(config.localeDir)

if (!languages.length) {
  console.log('No languages defined.')
  console.log(`(use "${chalk.yellow('lingui add-locale <language>')}" to add one)`)
  process.exit(1)
} else {
  console.log(emojify(':mag:  Extracting messages from source files:'))
  extractMessages(program.args.length ? program.args : config.srcPathDirs)
  console.log()

  console.log(emojify(':book:  Writing message catalogues:'))
  const stats = writeCatalogs(config.localeDir, languages)
  console.log()

  console.log(emojify(':chart_with_upwards_trend:  Catalog statistics:'))
  displayStats(languages, stats)
  console.log()

  console.log('Messages extracted!\n')
  console.log(`(use "${chalk.yellow('lingui extract')}" to update catalogs with new messages)`)
  console.log(`(use "${chalk.yellow('lingui compile')}" to compile catalogs for production)`)

  console.log(emojify(':sparkles:  Done!'))
}
