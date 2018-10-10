// @flow
import os from "os"
import fs from "fs"
import path from "path"
import * as R from "ramda"
import chalk from "chalk"
import glob from "glob"

import getFormat from "./formats"
import extract from "./extractors"
import { prettyOrigin, removeDirectory } from "./utils"
import type { LinguiConfig } from "@lingui/conf"

type CatalogProps = {
  name: ?string,
  path: string,
  include: Array<string>,
  exclude?: Array<string>
}

const NAME = "{name}"
const LOCALE = "{locale}"

export function Catalog(
  { name, path, include, exclude = [] }: CatalogProps,
  config: LinguiConfig
) {
  this.name = name
  this.path = path
  this.include = include
  this.exclude = [this.localeDir, ...exclude]
  this.config = config
  this.format = getFormat(config.format)
}

// export type MessageType = {
//   id: string,
//   translation: string,
//   defaults: ?string,
//   origin: Array<[number, string]>,
//   description: ?string,
//   comments: ?Array<string>,
//   obsolete: boolean,
//   flags: ?Array<string>
// }

Catalog.prototype = {
  make(options = {}) {
    const nextCatalog = this.collect()
    const prevCatalogs = this.readAll()

    // const clean = options.clean ? cleanObsolete : id => id
    // const catalogs = order(
    //   clean(
    //     catalog.merge(prevCatalogs, nextCatalog, {
    //       overwrite: options.overwrite
    //     })
    //   )
    // )

    const catalogs = this.merge(prevCatalogs, nextCatalog, {
      overwrite: options.overwrite
    })

    this.locales.map(locale => this.write(locale, catalogs[locale]))
  },

  /**
   * Collect messages from source paths. Return a raw message catalog as JSON.
   */
  collect({ verbose } = {}) {
    const tmpDir = path.join(os.tmpdir(), `lingui-${process.pid}`)

    if (fs.existsSync(tmpDir)) {
      removeDirectory(tmpDir, true)
    } else {
      fs.mkdirSync(tmpDir)
    }

    try {
      this.sourcePaths.forEach(filename =>
        extract(filename, tmpDir, { verbose })
      )

      return (function traverse(directory) {
        return fs
          .readdirSync(directory)
          .map(filename => {
            const filepath = path.join(directory, filename)

            if (fs.lstatSync(filepath).isDirectory()) {
              return traverse(filepath)
            }

            if (!filename.endsWith(".json")) return

            try {
              return JSON.parse(fs.readFileSync(filepath).toString())
            } catch (e) {
              return {}
            }
          })
          .filter(Boolean)
          .reduce(
            (catalog, messages) =>
              R.mergeWithKey(mergeOrigins, catalog, messages),
            {}
          )
      })(tmpDir)
    } catch (e) {
      throw e
    } finally {
      removeDirectory(tmpDir)
    }
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
            this.config.sourceLocale === locale ? message.defaults || key : "",
          ...message
        }),
        R.pick(newKeys, nextCatalog)
      )

      // Merge translations from previous catalog
      const mergedMessages = mergeKeys.map(key => {
        const updateFromDefaults =
          this.config.sourceLocale === locale &&
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

  write(locale, messages) {
    const filename = path.join(
      this.localeDir,
      path.join(locale, this.format.filename)
    )

    const created = !fs.existsSync(filename)
    this.format.write(filename, messages, { language: locale })
    return [created, filename]
  },

  read(locale) {
    // Read files using previous format, if available
    const sourceFormat = this.config.prevFormat
      ? getFormat(this.config.prevFormat)
      : this.format

    const filename =
      this.path.replace(LOCALE, locale) + sourceFormat.catalogExtension

    if (!fs.existsSync(filename)) return null
    return sourceFormat.read(filename)
  },

  readAll() {
    return R.mergeAll(
      this.locales.map(locale => ({
        [locale]: this.read(locale)
      }))
    )
  },

  get sourcePaths() {
    const includeGlob = this.include.map(includePath =>
      path.join(includePath, "**", "*.*")
    )
    const patterns =
      includeGlob.length > 1 ? `{${includeGlob.join("|")}` : includeGlob[0]
    return glob.sync(patterns, { ignore: this.exclude })
  },

  get localeDir() {
    const localePatternIndex = this.path.indexOf("{locale}")
    if (localePatternIndex === -1) {
      throw Error("Invalid catalog path: {locale} variable is missing")
    }
    return this.path.substr(0, localePatternIndex)
  },

  get locales() {
    return this.config.locales
  }
}

/**
 * Parse `config.catalogs` and return a list of configured Catalog instances.
 */
export function getCatalogs(config: LinguiConfig): Array<Catalog> {
  const catalogsConfig = config.catalogs
  const catalogs = []

  Object.keys(catalogsConfig).forEach(catalogPath => {
    // Validate that `catalogPath` doesn't end with trailing slash
    if (catalogPath.endsWith(path.sep)) {
      const extension = getFormat(config.format).catalogExtension
      const correctPath = catalogPath.slice(0, -1)
      const examplePath =
        correctPath.replace(
          LOCALE,
          // Show example using one of configured locales (if any)
          (config.locales || [])[0] || "en"
        ) + extension
      throw new Error(
        `Remove trailing slash from "${catalogPath}". Catalog path isn't a directory,` +
          ` but translation file without extension. For example, catalog path "${correctPath}"` +
          ` results in translation file "${examplePath}".`
      )
    }

    const sourcePaths = ensureArray(catalogsConfig[catalogPath])

    const include = sourcePaths
      // exclude ignore patterns
      .filter(path => path[0] !== "!")
      // first exclamation mark might be escaped
      .map(path => path.replace(/^\\!/, "!"))
      .map(path => normalizeRelative(path))

    const exclude = sourcePaths
      // filter ignore patterns
      .filter(path => path[0] === "!")
      // remove exlamation mark at the beginning
      .map(path => path.slice(1))
      .map(path => normalizeRelative(path))

    // catalogPath without {name} pattern -> always refers to a single catalog
    if (!catalogPath.includes(NAME)) {
      // Validate that sourcePaths doesn't use {name} pattern either
      const invalidSource = sourcePaths.filter(path => path.includes(NAME))[0]
      if (invalidSource !== undefined) {
        throw new Error(
          `Catalog with path "${catalogPath}" doesn't have a {name} pattern in it,` +
            ` but one of source directories uses it: "${invalidSource}".` +
            ` Either add {name} pattern to "${catalogPath}" or remove it from all source directories.`
        )
      }

      // catalog name is the last directory of catalogPath.
      // If the last part is {locale}, then catalog doesn't have an explicit name
      const name = (function() {
        const _name = catalogPath.split(path.sep).slice(-1)[0]
        return _name !== LOCALE ? _name : null
      })()

      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelative(catalogPath),
            include,
            exclude
          },
          config
        )
      )
      return
    }

    const patterns = include.map(path => path.replace(NAME, "*"))
    const candidates = glob.sync(
      patterns.length > 1 ? `{${patterns.join(",")}` : patterns[0],
      {
        ignore: exclude
      }
    )

    candidates.forEach(catalogDir => {
      const name = path.basename(catalogDir)
      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelative(catalogPath.replace(NAME, name)),
            include: include.map(path => path.replace(NAME, name)),
            exclude: exclude.map(path => path.replace(NAME, name))
          },
          config
        )
      )
    })
  })

  return catalogs
}

/**
 * Merge origins for messages found in different places. All other attributes
 * should be the same (raise an error if defaults are different).
 */
function mergeOrigins(msgId, prev, next) {
  if (prev.defaults !== next.defaults) {
    throw new Error(
      `Encountered different defaults for message ${chalk.yellow(msgId)}` +
        `\n${chalk.yellow(prettyOrigin(prev.origin))} ${prev.defaults}` +
        `\n${chalk.yellow(prettyOrigin(next.origin))} ${next.defaults}`
    )
  }

  return {
    ...next,
    origin: R.concat(prev.origin, next.origin)
  }
}

/**
 * Ensure that value is always array. If not, turn it into an array of one element.
 */
const ensureArray = <T>(value: Array<T> | T): Array<T> =>
  Array.isArray(value) ? value : [value]

/**
 * Normalize relative paths
 *
 * Remove ./ at the beginning: ./relative  => relative
 *                             relative    => relative
 * Preserve directory paths:   ./relative/ => relative/
 * Preserve absolute paths:    /absolute/path => /absolute/path
 */
function normalizeRelative(sourcePath: string): string {
  // absolute path, do nothing
  if (sourcePath.startsWith("/")) return sourcePath

  // preserve trailing slash for directories
  const isDir = sourcePath.endsWith("/")
  return (
    path.relative(process.cwd(), path.resolve(sourcePath)) + (isDir ? "/" : "")
  )
}
