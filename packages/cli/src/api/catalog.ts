import os from "os"
import fs from "fs-extra"
import path from "path"
import * as R from "ramda"
import chalk from "chalk"
import glob from "glob"
import minimatch from "minimatch"

import getFormat from "./formats"
import extract from "./extractors"
import { prettyOrigin, removeDirectory } from "./utils"
import { CliExtractOptions } from "../lingui-extract"
import { LinguiConfig } from "@lingui/conf"

type CatalogProps = {
  name?: string
  path: string
  include: Array<string>
  exclude?: Array<string>
}

type MakeOptions = CliExtractOptions & {
  projectType?: string
}

const NAME = "{name}"
const LOCALE = "{locale}"

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

export class Catalog {
  name?: string
  path: string
  include: Array<string>
  exclude: Array<string>
  config: LinguiConfig
  format: any

  constructor(
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

  make(options: MakeOptions = {}) {
    const nextCatalog = this.collect(options)
    const prevCatalogs = this.readAll()

    const catalogs = this.merge(prevCatalogs, nextCatalog, {
      overwrite: options.overwrite
    })

    // Map over all locales and post-process each catalog
    const postProcess = R.map(
      R.pipe(
        // Clean obsolete messages
        options.clean ? cleanObsolete : R.identity,
        // Sort messages
        orderByMessageId
      )
    )
    this.writeAll(postProcess(catalogs))
  }

  /**
   * Collect messages from source paths. Return a raw message catalog as JSON.
   */
  collect(options: Object = {}) {
    const tmpDir = path.join(os.tmpdir(), `lingui-${process.pid}`)

    if (fs.existsSync(tmpDir)) {
      removeDirectory(tmpDir, true)
    } else {
      fs.mkdirSync(tmpDir)
    }

    try {
      this.sourcePaths.forEach(filename =>
        extract(filename, tmpDir, {
          verbose: options.verbose,
          babelOptions: this.config.extractBabelOptions,
          projectType: options.projectType
        })
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
            } catch (e) {}
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
  }

  merge(prevCatalogs: Object, nextCatalog: Object, options: Object = {}) {
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
  }

  getTranslations(locale: string, options: Object) {
    const catalogs = this.readAll()
    return R.mapObjIndexed(
      (value, key) => this.getTranslation(catalogs, locale, key, options),
      catalogs[locale]
    )
  }

  getTranslation(
    catalogs: Object,
    locale: string,
    key: string,
    { fallbackLocale, sourceLocale }: Object
  ) {
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
  }

  write(locale: string, messages: Object) {
    const filename =
      this.path.replace(LOCALE, locale) + this.format.catalogExtension

    const created = !fs.existsSync(filename)
    const basedir = path.dirname(filename)
    if (!fs.existsSync(basedir)) {
      fs.mkdirpSync(basedir)
    }
    this.format.write(filename, messages, { locale })
    return [created, filename]
  }

  writeAll(catalogs: Object) {
    this.locales.forEach(locale => this.write(locale, catalogs[locale]))
  }

  writeCompiled(locale: string, compiledCatalog: string) {
    const filename = this.path.replace(LOCALE, locale) + ".js"

    const basedir = path.dirname(filename)
    if (!fs.existsSync(basedir)) {
      fs.mkdirpSync(basedir)
    }
    fs.writeFileSync(filename, compiledCatalog)
    return filename
  }

  read(locale: string) {
    // Read files using previous format, if available
    const sourceFormat = this.config.prevFormat
      ? getFormat(this.config.prevFormat)
      : this.format

    const filename =
      this.path.replace(LOCALE, locale) + sourceFormat.catalogExtension

    if (!fs.existsSync(filename)) return null
    return sourceFormat.read(filename)
  }

  readAll() {
    return R.mergeAll(
      this.locales.map(locale => ({
        [locale]: this.read(locale)
      }))
    )
  }

  get sourcePaths() {
    const includeGlob = this.include.map(includePath =>
      path.join(includePath, "**", "*.*")
    )
    const patterns =
      includeGlob.length > 1 ? `{${includeGlob.join("|")}` : includeGlob[0]
    return glob.sync(patterns, { ignore: this.exclude })
  }

  get localeDir() {
    const localePatternIndex = this.path.indexOf("{locale}")
    if (localePatternIndex === -1) {
      throw Error("Invalid catalog path: {locale} variable is missing")
    }
    return this.path.substr(0, localePatternIndex)
  }

  get locales() {
    return this.config.locales
  }
}

/**
 * Parse `config.catalogs` and return a list of configured Catalog instances.
 */
export function getCatalogs(config: LinguiConfig) {
  const catalogsConfig = config.catalogs
  const catalogs = []

  catalogsConfig.forEach(catalog => {
    // Validate that `catalogPath` doesn't end with trailing slash
    if (catalog.path.endsWith(path.sep)) {
      const extension = getFormat(config.format).catalogExtension
      const correctPath = catalog.path.slice(0, -1)
      const examplePath =
        correctPath.replace(
          LOCALE,
          // Show example using one of configured locales (if any)
          (config.locales || [])[0] || "en"
        ) + extension
      throw new Error(
        // prettier-ignore
        `Remove trailing slash from "${catalog.path}". Catalog path isn't a directory,` +
          ` but translation file without extension. For example, catalog path "${correctPath}"` +
          ` results in translation file "${examplePath}".`
      )
    }

    const include = ensureArray(catalog.include).map(path =>
      normalizeRelativePath(path)
    )
    const exclude = ensureArray(catalog.exclude).map(path =>
      normalizeRelativePath(path)
    )

    // catalogPath without {name} pattern -> always refers to a single catalog
    if (!catalog.path.includes(NAME)) {
      // Validate that sourcePaths doesn't use {name} pattern either
      const invalidSource = include.filter(path => path.includes(NAME))[0]
      if (invalidSource !== undefined) {
        throw new Error(
          `Catalog with path "${catalog.path}" doesn't have a {name} pattern` +
            ` in it, but one of source directories uses it: "${invalidSource}".` +
            ` Either add {name} pattern to "${catalog.path}" or remove it` +
            ` from all source directories.`
        )
      }

      // catalog name is the last directory of catalogPath.
      // If the last part is {locale}, then catalog doesn't have an explicit name
      const name = (function() {
        const _name = catalog.path.split(path.sep).slice(-1)[0]
        return _name !== LOCALE ? _name : null
      })()

      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelativePath(catalog.path),
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
            path: normalizeRelativePath(catalog.path.replace(NAME, name)),
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

export function getCatalogForFile(file: string, catalogs: Array<Catalog>) {
  for (const catalog of catalogs) {
    const regexp = new RegExp(
      minimatch
        // convert glob pattern to regexp
        .makeRe(catalog.path + catalog.format.catalogExtension)
        // convert it back to string, so we can replace {locale} with regexp pattern
        .toString()
        // remove regexp delimiters
        .slice(1, -1)
        .replace("\\{locale\\}", "([^/.]+)")
    )

    const match = regexp.exec(file)
    if (!match) continue

    return {
      locale: match[1],
      catalog
    }
  }

  return null
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
const ensureArray = <T>(value: Array<T> | T | null | undefined): Array<T> => {
  if (value == null) return []

  return Array.isArray(value) ? value : [value]
}

/**
 * Remove ./ at the beginning: ./relative  => relative
 *                             relative    => relative
 * Preserve directories:       ./relative/ => relative/
 * Preserve absolute paths:    /absolute/path => /absolute/path
 */
function normalizeRelativePath(sourcePath: string): string {
  // absolute path, do nothing
  if (sourcePath.startsWith("/")) return sourcePath

  // preserve trailing slash for directories
  const isDir = sourcePath.endsWith("/")
  return (
    path.relative(process.cwd(), path.resolve(sourcePath)) + (isDir ? "/" : "")
  )
}

export const cleanObsolete = R.filter(message => !message.obsolete)

export const orderByMessageId = R.pipe(
  R.toPairs,
  R.sortBy(R.prop(0)),
  R.fromPairs
)
