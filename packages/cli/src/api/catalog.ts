import fs from "fs"
import path from "path"
import mkdirp from "mkdirp"
import glob from "glob"
import * as R from "ramda"

import { LinguiConfig, CatalogApi } from "./types"
import * as locales from "./locales"
import { formats } from "."

export default (config: LinguiConfig): CatalogApi => {
  const format = formats[config.format]
  if (!format) {
    throw new Error(`Unknown format ${config.format}.`)
  }

  const prevFormat = formats[config.prevFormat]
  if (config.prevFormat && !prevFormat) {
    throw new Error(`Unknown format ${config.format}.`)
  }

  return {
    write(locale, messages) {
      const filename = path.join(
        config.localeDir,
        path.join(locale, format.filename)
      )

      const created = !fs.existsSync(filename)
      format.write(filename, messages, { language: locale })
      return [created, filename]
    },

    read(locale) {
      const sourceFormat = prevFormat || format
      const filename = path.join(
        config.localeDir,
        path.join(locale, sourceFormat.filename)
      )

      if (!fs.existsSync(filename)) return null
      // Read files using previous format, if available
      return sourceFormat.read(filename)
    },

    readAll() {
      return R.mergeAll(
        this.getLocales().map(locale => ({
          [locale]: this.read(locale)
        }))
      )
    },

    merge(prevCatalogs, nextCatalog, options = {}) {
      const nextKeys = R.keys(nextCatalog)

      return R.mapObjIndexed((prevCatalog, locale) => {
        const prevKeys = R.keys(prevCatalog)

        const newKeys = R.difference(nextKeys, prevKeys)
        const mergeKeys = R.intersection(nextKeys, prevKeys)
        const obsoleteKeys = R.difference(prevKeys, nextKeys)

        // Initialize new catalog with new keys
        const newMessages = R.mapObjIndexed(
          (message, key) => ({
            translation:
              config.sourceLocale === locale ? message.defaults || key : "",
            ...message
          }),
          R.pick(newKeys, nextCatalog)
        )

        // Merge translations from previous catalog
        const mergedMessages = mergeKeys.map(key => {
          const updateFromDefaults =
            config.sourceLocale === locale &&
            (prevCatalog[key].translation === prevCatalog[key].defaults ||
              options.overwrite)

          const translation = updateFromDefaults
            ? nextCatalog[key].defaults
            : prevCatalog[key].translation

          return {
            [key]: {
              translation,
              ...R.omit(["obsolete, translation"], nextCatalog[key])
            }
          }
        })

        // Mark all remaining translations as obsolete
        const obsoleteMessages = obsoleteKeys.map(key => ({
          [key]: {
            ...prevCatalog[key],
            obsolete: true
          }
        }))

        return R.mergeAll([newMessages, ...mergedMessages, ...obsoleteMessages])
      }, prevCatalogs)
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
        path.join(locale, "messages.js")
      )

      fs.writeFileSync(filename, content)
      return filename
    },

    getLocale(filename) {
      const [messages, locale] = filename.split(path.sep).reverse()

      if (messages !== format.filename || !locales.isValid(locale)) return null
      return locale
    },

    getLocales() {
      const pattern = path.join(config.localeDir, "*")

      return glob
        .sync(pattern)
        .map(filename => {
          // Don't use path.sep here, because glob.sync normalizes path separators
          const [locale] = filename.split("/").reverse()
          return locales.isValid(locale) && locale
        })
        .filter(Boolean)
    },

    addLocale(locale) {
      if (!locales.isValid(locale) && locale !== config.pseudoLocale) {
        return [false, null]
      }

      const filename = path.join(
        config.localeDir,
        path.join(locale, format.filename)
      )

      if (!fs.existsSync(filename)) {
        const dirname = path.dirname(filename)

        mkdirp.sync(dirname)
        this.write(locale, {})

        return [true, filename]
      }

      return [false, filename]
    }
  }
}
