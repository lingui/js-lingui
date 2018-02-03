// @flow
import fs from "fs"
import path from "path"
import mkdirp from "mkdirp"
import glob from "glob"
import R from "ramda"

import type { LinguiConfig, CatalogFormat } from "./types"
import * as locales from "./utils/locales"

const sourceFilename = path.join("{locale}", "messages.json")
const compiledFilename = path.join("{locale}", "messages.js")

export default (config: LinguiConfig): CatalogFormat => ({
  formatFilename(pattern, locale) {
    return pattern.replace("{locale}", locale)
  },

  write(locale, messages) {
    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )

    const created = !fs.existsSync(filename)
    fs.writeFileSync(filename, JSON.stringify(messages, null, 2))
    return [created, filename]
  },

  read(locale) {
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

  merge(nextCatalog) {
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
        const newMessages = R.mapObjIndexed(
          (message, key) => ({
            translation: config.sourceLocale === locale ? key : "",
            ...message
          }),
          R.pick(newKeys, nextCatalog)
        )

        // Merge translations from previous catalog
        const mergedMessages = mergeKeys.map(key => ({
          [key]: {
            translation: prevCatalog[key].translation,
            ...R.omit(["obsolete, translation"], nextCatalog[key])
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

  getTranslation(catalogs, locale, key, { fallbackLocale, sourceLocale }) {
    const getTranslation = locale => catalogs[locale][key].translation

    return (
      // Get translation in target locale
      getTranslation(locale) ||
      // Get translation in fallbackLocale (if any)
      (fallbackLocale && getTranslation(fallbackLocale)) ||
      // Get message default
      catalogs[locale][key].defaults ||
      // If sourceLocale is either target locale of fallback one, use key
      (sourceLocale && sourceLocale === locale && key) ||
      (sourceLocale &&
        fallbackLocale &&
        sourceLocale === fallbackLocale &&
        key) ||
      // Otherwise no translation is available
      undefined
    )
  },

  writeCompiled(locale, content) {
    const filename = path.join(
      config.localeDir,
      this.formatFilename(compiledFilename, locale)
    )

    fs.writeFileSync(filename, content)
    return filename
  },

  getLocale(filename) {
    const filenameRe = new RegExp(
      this.formatFilename(sourceFilename, locales.localeRe.source)
    )
    const match = filenameRe.exec(filename)
    if (!match) return null

    return match[1]
  },

  getLocales() {
    const pattern = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, "*")
    )

    return glob
      .sync(pattern)
      .map(filename => this.getLocale(filename))
      .filter(Boolean)
  },

  addLocale(locale) {
    if (!locales.isValid(locale)) {
      return [false, null]
    }

    const filename = path.join(
      config.localeDir,
      this.formatFilename(sourceFilename, locale)
    )

    if (!fs.existsSync(filename)) {
      const dirname = path.dirname(filename)

      mkdirp.sync(dirname)
      this.write(locale, {})

      return [true, filename]
    }

    return [false, filename]
  }
})
