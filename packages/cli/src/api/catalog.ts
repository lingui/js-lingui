import os from "os"
import fs from "fs-extra"
import path from "path"
import * as R from "ramda"
import chalk from "chalk"
import glob from "glob"
import micromatch from "micromatch"
import normalize from "normalize-path"

import { LinguiConfig, OrderBy, FallbackLocales } from "@lingui/conf"

import getFormat, { CatalogFormatter } from "./formats"
import extract from "./extractors"
import { prettyOrigin, removeDirectory } from "./utils"
import { CliExtractOptions } from "../lingui-extract"
import { CliExtractTemplateOptions } from "../lingui-extract-template"

const NAME = "{name}"
const LOCALE = "{locale}"
const LOCALE_SUFFIX_RE = /\{locale\}.*$/
const PATHSEP = "/" // force posix everywhere

type MessageOrigin = [string, number];

export type ExtractedMessageType = {
  message?: string
  origin?: MessageOrigin[]
  comment?: string
  comments?: string[]
  obsolete?: boolean
  flags?: string[]
  description?: string
}

export type MessageType = ExtractedMessageType & {
  translation: string
}

type ExtractedCatalogType = {
  [msgId: string]: ExtractedMessageType
}

export type CatalogType = {
  [msgId: string]: MessageType
}

export type AllCatalogsType = {
  [locale: string]: CatalogType
}

export type MakeOptions = CliExtractOptions & {
  projectType?: string
  orderBy?: OrderBy
}

export type MakeTemplateOptions = CliExtractTemplateOptions & {
  projectType?: string
  orderBy?: OrderBy
}

type CollectOptions = MakeOptions | MakeTemplateOptions

export type MergeOptions = {
  overwrite: boolean
}

export type GetTranslationsOptions = {
  sourceLocale: string
  fallbackLocales: FallbackLocales
}

type CatalogProps = {
  name?: string
  path: string
  include: Array<string>
  exclude?: Array<string>
}

export class Catalog {
  name?: string
  path: string
  include: Array<string>
  exclude: Array<string>
  config: LinguiConfig
  format: CatalogFormatter

  constructor(
    { name, path, include, exclude = [] }: CatalogProps,
    config: LinguiConfig
  ) {
    this.name = name
    this.path = normalizeRelativePath(path)
    this.include = include.map(normalizeRelativePath)
    this.exclude = [this.localeDir, ...exclude.map(normalizeRelativePath)]
    this.config = config
    this.format = getFormat(config.format)
  }

  make(options: MakeOptions) {
    const nextCatalog = this.collect(options)
    const prevCatalogs = this.readAll()

    const catalogs = this.merge(prevCatalogs, nextCatalog, {
      overwrite: options.overwrite,
    })

    // Map over all locales and post-process each catalog
    const cleanAndSort = (R.map(
      R.pipe(
        // Clean obsolete messages
        options.clean ? cleanObsolete : R.identity,
        // Sort messages
        order(options.orderBy)
      )
    ) as unknown) as (catalog: AllCatalogsType) => AllCatalogsType

    const sortedCatalogs = cleanAndSort(catalogs)

    if (options.locale) {
      this.write(options.locale, sortedCatalogs[options.locale])
    } else {
      this.writeAll(sortedCatalogs)
    }
  }

  makeTemplate(options: MakeTemplateOptions) {
    const catalog = this.collect(options)
    const sort = order(options.orderBy) as (catalog: CatalogType) => CatalogType
    this.writeTemplate(sort(catalog as CatalogType))
  }

  /**
   * Collect messages from source paths. Return a raw message catalog as JSON.
   */
  collect(options: CollectOptions) {
    const tmpDir = path.join(os.tmpdir(), `lingui-${process.pid}`)

    if (fs.existsSync(tmpDir)) {
      removeDirectory(tmpDir, true)
    } else {
      fs.mkdirSync(tmpDir)
    }

    try {
      this.sourcePaths.forEach((filename) =>
        extract(filename, tmpDir, {
          verbose: options.verbose,
          babelOptions: this.config.extractBabelOptions,
          projectType: options.projectType,
        })
      )

      return (function traverse(directory) {
        return fs
          .readdirSync(directory)
          .map((filename) => {
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

  merge(
    prevCatalogs: AllCatalogsType,
    nextCatalog: ExtractedCatalogType,
    options: MergeOptions
  ) {
    const nextKeys = R.keys(nextCatalog).map(String)

    return R.mapObjIndexed((prevCatalog, locale) => {
      const prevKeys = R.keys(prevCatalog).map(String)

      const newKeys = R.difference(nextKeys, prevKeys)
      const mergeKeys = R.intersection(nextKeys, prevKeys)
      const obsoleteKeys = R.difference(prevKeys, nextKeys)

      // Initialize new catalog with new keys
      const newMessages = R.mapObjIndexed(
        (message: MessageType, key) => ({
          translation:
            this.config.sourceLocale === locale ? message.message || key : "",
          ...message,
        }),
        R.pick(newKeys, nextCatalog)
      )

      // Merge translations from previous catalog
      const mergedMessages = mergeKeys.map((key) => {
        const updateFromDefaults =
          this.config.sourceLocale === locale &&
          (prevCatalog[key].translation === prevCatalog[key].message ||
            options.overwrite)

        const translation = updateFromDefaults
          ? nextCatalog[key].message
          : prevCatalog[key].translation

        return {
          [key]: {
            translation,
            ...R.omit(["obsolete, translation"], nextCatalog[key]),
          },
        }
      })

      // Mark all remaining translations as obsolete
      const obsoleteMessages = obsoleteKeys.map((key) => ({
        [key]: {
          ...prevCatalog[key],
          obsolete: true,
        },
      }))

      return R.mergeAll([newMessages, ...mergedMessages, ...obsoleteMessages])
    }, prevCatalogs)
  }

  getTranslations(locale: string, options: GetTranslationsOptions) {
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
    { fallbackLocales, sourceLocale }: GetTranslationsOptions
  ) {
    if (!catalogs[locale].hasOwnProperty(key)) {
      console.error(`Message with key ${key} is missing in locale ${locale}`)
    }

    const getTranslation = (locale) => catalogs[locale][key].translation

    const getMultipleFallbacks = (locale) => {
      const fL = fallbackLocales[locale]

      // some probably the fallback will be undefined, so just search by locale
      if (!fL) return null

      if (Array.isArray(fL)) {
        for (const fallbackLocale of fL) {
          if (catalogs[fallbackLocale]) {
            return getTranslation(fallbackLocale)
          }
        }
      } else {
        return getTranslation(fL)
      }
    }

    return (
      // Get translation in target locale
      getTranslation(locale) ||
      // We search in fallbackLocales as dependent of each locale
      getMultipleFallbacks(locale) ||
      // Get translation in fallbackLocales.default (if any)
      (fallbackLocales.default && getTranslation(fallbackLocales.default)) ||
      // Get message default
      catalogs[locale][key].defaults ||
      // If sourceLocale is either target locale of fallback one, use key
      (sourceLocale && sourceLocale === locale && key) ||
      (sourceLocale &&
        fallbackLocales.default &&
        sourceLocale === fallbackLocales.default &&
        key) ||
      // Otherwise no translation is available
      undefined
    )
  }

  write(locale: string, messages: CatalogType) {
    const filename =
      this.path.replace(LOCALE, locale) + this.format.catalogExtension

    const created = !fs.existsSync(filename)
    const basedir = path.dirname(filename)
    if (!fs.existsSync(basedir)) {
      fs.mkdirpSync(basedir)
    }

    const options = { ...this.config.formatOptions, locale }

    this.format.write(filename, messages, options)
    return [created, filename]
  }

  writeAll(catalogs: AllCatalogsType) {
    this.locales.forEach((locale) => this.write(locale, catalogs[locale]))
  }

  writeTemplate(messages: CatalogType) {
    const filename = this.templateFile
    const basedir = path.dirname(filename)
    if (!fs.existsSync(basedir)) {
      fs.mkdirpSync(basedir)
    }
    const options = { ...this.config.formatOptions, locale: undefined }
    const poFormat = getFormat("po")
    poFormat.write(filename, messages, options)
  }

  writeCompiled(locale: string, compiledCatalog: string, namespace?: string) {
    const ext = `.${namespace === "es" ? "mjs" : "js"}`
    const filename = this.path.replace(LOCALE, locale) + ext

    const basedir = path.dirname(filename)
    if (!fs.existsSync(basedir)) {
      fs.mkdirpSync(basedir)
    }
    fs.writeFileSync(filename, compiledCatalog)
    return filename
  }

  read(locale: string) {
    const filename =
      this.path.replace(LOCALE, locale) + this.format.catalogExtension

    if (!fs.existsSync(filename)) return null
    return this.format.read(filename)
  }

  readAll() {
    return R.mergeAll(
      this.locales.map((locale) => ({
        [locale]: this.read(locale),
      }))
    ) as AllCatalogsType
  }

  readTemplate() {
    const filename = this.templateFile
    if (!fs.existsSync(filename)) return null
    return this.format.read(filename)
  }

  get sourcePaths() {
    const includeGlobs = this.include.map(
      (includePath) =>
        includePath.endsWith(PATHSEP)
          ? [includePath, "**", "*.*"].join(PATHSEP) // directory
          : includePath // file
    )
    const patterns =
      includeGlobs.length > 1 ? `{${includeGlobs.join(",")}}` : includeGlobs[0]
    return glob.sync(patterns, { ignore: this.exclude, mark: true })
  }

  get templateFile() {
    return this.path.replace(LOCALE_SUFFIX_RE, "messages.pot")
  }

  get localeDir() {
    const localePatternIndex = this.path.indexOf(LOCALE)
    if (localePatternIndex === -1) {
      throw Error(`Invalid catalog path: ${LOCALE} variable is missing`)
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

  catalogsConfig.forEach((catalog) => {
    // Validate that `catalogPath` doesn't end with trailing slash
    if (catalog.path.endsWith(PATHSEP)) {
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

    const include = ensureArray(catalog.include).map(normalizeRelativePath)
    const exclude = ensureArray(catalog.exclude).map(normalizeRelativePath)

    // catalog.path without {name} pattern -> always refers to a single catalog
    if (!catalog.path.includes(NAME)) {
      // Validate that sourcePaths doesn't use {name} pattern either
      const invalidSource = include.find((path) => path.includes(NAME))
      if (invalidSource !== undefined) {
        throw new Error(
          `Catalog with path "${catalog.path}" doesn't have a {name} pattern` +
            ` in it, but one of source directories uses it: "${invalidSource}".` +
            ` Either add {name} pattern to "${catalog.path}" or remove it` +
            ` from all source directories.`
        )
      }

      // catalog name is the last directory of catalog.path.
      // If the last part is {locale}, then catalog doesn't have an explicit name
      const name = (function () {
        const _name = catalog.path.split(PATHSEP).slice(-1)[0]
        return _name !== LOCALE ? _name : null
      })()

      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelativePath(catalog.path),
            include,
            exclude,
          },
          config
        )
      )
      return
    }

    const patterns = include.map((path) => path.replace(NAME, "*"))
    const candidates = glob.sync(
      patterns.length > 1 ? `{${patterns.join(",")}` : patterns[0],
      {
        ignore: exclude,
        mark: true
      }
    )

    candidates.forEach((catalogDir) => {
      const name = path.basename(catalogDir)
      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelativePath(catalog.path.replace(NAME, name)),
            include: include.map((path) => path.replace(NAME, name)),
            exclude: exclude.map((path) => path.replace(NAME, name)),
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
    const catalogFile = `${catalog.path}${catalog.format.catalogExtension}`
    const catalogGlob = catalogFile.replace(LOCALE, "*")
    const match = micromatch.capture(
      normalizeRelativePath(catalogGlob),
      normalizeRelativePath(file)
    )
    if (match) {
      return {
        locale: match[0],
        catalog,
      }
    }
  }

  return null
}

/**
 * Create catalog for merged messages.
 */
export function getCatalogForMerge(config: LinguiConfig) {
  const catalogConfig = config

  if (catalogConfig.catalogsMergePath.endsWith(PATHSEP)) {
    const extension = getFormat(config.format).catalogExtension
    const correctPath = catalogConfig.catalogsMergePath.slice(0, -1)
    const examplePath =
      correctPath.replace(
        LOCALE,
        // Show example using one of configured locales (if any)
        (config.locales || [])[0] || "en"
      ) + extension
    throw new Error(
      // prettier-ignore
      `Remove trailing slash from "${catalogConfig.catalogsMergePath}". Catalog path isn't a directory,` +
          ` but translation file without extension. For example, catalog path "${correctPath}"` +
          ` results in translation file "${examplePath}".`
    )
  }

  // catalog name is the last directory of catalogPath.
  // If the last part is {locale}, then catalog doesn't have an explicit name
  const name = (function () {
    const _name = path.basename(
      normalizeRelativePath(catalogConfig.catalogsMergePath)
    )
    return _name !== LOCALE ? _name : null
  })()

  const catalog = new Catalog(
    {
      name,
      path: normalizeRelativePath(catalogConfig.catalogsMergePath),
      include: [],
      exclude: [],
    },
    config
  )
  return catalog
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
    origin: R.concat(prev.origin, next.origin),
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
export function normalizeRelativePath(sourcePath: string): string {
  if (path.isAbsolute(sourcePath)) {
    // absolute path
    return normalize(sourcePath, false)
  }

  const isDir = fs.existsSync(sourcePath) && fs.lstatSync(sourcePath).isDirectory()
  return (
    normalize(path.relative(process.cwd(), path.resolve(sourcePath))) +
    (isDir ? PATHSEP : "")
  )
}

export const cleanObsolete = R.filter(
  (message: ExtractedMessageType) => !message.obsolete
)

export function order(
  by: OrderBy
): (catalog: ExtractedCatalogType) => ExtractedCatalogType {
  return {
    messageId: orderByMessageId,
    origin: orderByOrigin,
  }[by]
}

/**
 * Object keys are in the same order as they were created
 * https://stackoverflow.com/a/31102605/1535540
 */
export function orderByMessageId(messages) {
  const orderedMessages = {}
  Object.keys(messages)
    .sort()
    .forEach(function (key) {
      orderedMessages[key] = messages[key]
    })

  return orderedMessages
}

export function orderByOrigin(messages) {
  function getFirstOrigin(messageKey) {
    const sortedOrigins = messages[messageKey].origin.sort((a, b) => {
      if (a[0] < b[0]) return -1
      if (a[0] > b[0]) return 1
      return 0
    })
    return sortedOrigins[0]
  }

  return Object.keys(messages)
    .sort(function (a, b) {
      const [aFile, aLineNumber] = getFirstOrigin(a)
      const [bFile, bLineNumber] = getFirstOrigin(b)

      if (aFile < bFile) return -1
      if (aFile > bFile) return 1

      if (aLineNumber < bLineNumber) return -1
      if (aLineNumber > bLineNumber) return 1

      return 0
    })
    .reduce((acc, key) => {
      acc[key] = messages[key]
      return acc
    }, {})
}
