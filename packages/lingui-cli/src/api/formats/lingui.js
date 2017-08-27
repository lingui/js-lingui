// @flow
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import glob from 'glob'
import R from 'ramda'

import type { LinguiConfig, CatalogFormat } from './types'
import * as locales from './utils/locales'

const sourceFilename = '{locale}/messages.json'
const compiledFilename = '{locale}/messages.js'

export default (config: LinguiConfig): CatalogFormat => ({
  formatFilename (pattern, locale) {
    return pattern.replace('{locale}', locale)
  },

  write (locale, messages) {
    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )

    const created = !fs.existsSync(filename)
    fs.writeFileSync(filename, JSON.stringify(messages, null, 2))
    return [created, filename]
  },

  read (locale) {
    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )

    if (!fs.existsSync(filename)) return null

    const raw = fs.readFileSync(filename).toString()

    try {
      return JSON.parse(raw)
    } catch (e) {
      return null
    }
  },

  merge (nextCatalog) {
    const nextKeys = R.keys(nextCatalog)

    return R.mergeAll(
      this.getLocales().map(locale => {
        const prevCatalog = this.read(locale)
        if (!prevCatalog) return nextCatalog

        const prevKeys = R.keys(prevCatalog)

        const newKeys = R.difference(nextKeys, prevKeys)
        const mergeKeys = R.intersection(nextKeys, prevKeys)
        const obsoleteKeys = R.difference(prevKeys, nextKeys)

        // Initialize new catalog with new keys
        const newMessages = R.pick(newKeys, nextCatalog)

        // Merge translations from previous catalog
        const mergedMessages = mergeKeys.map(key => ({
          [key]: {
            ...R.omit(['obsolete'], nextCatalog[key]),
            translation: prevCatalog[key].translation
          }
        }))

        // Mark all remaining translations as obsolete
        const obsoleteMessages = obsoleteKeys.map(key => ({
          [key]: {
            ...prevCatalog[key],
            obsolete: true
          }
        }))

        const newCatalog = R.mergeAll([
          newMessages,
          ...mergedMessages,
          ...obsoleteMessages
        ])
        return { [locale]: newCatalog }
      })
    )
  },

  getTranslation (catalogs, locale, key, options) {
    const getOrDefault = ({ translation, defaults }) => translation || defaults
    const translation = getOrDefault(catalogs[locale][key])

    const fallbackLanguage = options.fallbackLanguage
    if (!translation && fallbackLanguage) {
      return getOrDefault(catalogs[fallbackLanguage][key]) || key
    }

    return translation || key
  },

  writeCompiled (locale, content) {
    const filename = path.join(
      config.localeDir,
      this.formatFilename(compiledFilename, locale)
    )

    fs.writeFileSync(filename, content)
    return filename
  },

  getLocales () {
    const pattern = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, '*')
    )
    const sources = glob.sync(pattern)
    const filenameRe = new RegExp(this.formatFilename(sourceFilename, locales.localeRe.source))

    return sources
      .map(filename => {
        const match = filenameRe.exec(filename)
        if (!match) return null

        return match[1]
      })
      .filter(Boolean)
  },

  addLocale (locale) {
    if (!locales.isValid(locale)) {
      return [false, null]
    }

    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )

    if (!fs.existsSync(filename)) {
      const dirname = filename.substring(0, filename.lastIndexOf('/'))

      mkdirp.sync(dirname)
      this.write(locale, {})

      return [true, filename]
    }

    return [false, filename]
  }
})
