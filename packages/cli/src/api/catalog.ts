import fs from "fs"
import path from "path"
import * as R from "ramda"
import glob from "glob"
import micromatch from "micromatch"
import normalize from "normalize-path"

import {
  OrderBy,
  LinguiConfigNormalized,
  ExtractedMessage,
  ExtractorType,
} from "@lingui/conf"

import getFormat, {
  CatalogFormatOptionsInternal,
  CatalogFormatter,
} from "./formats"
import extract from "./extractors"
import { CliExtractOptions } from "../lingui-extract"
import { CliExtractTemplateOptions } from "../lingui-extract-template"
import { CompiledCatalogNamespace } from "./compile"
import { prettyOrigin } from "./utils"
import chalk from "chalk"
import {
  getTranslationsForCatalog,
  GetTranslationsOptions,
} from "./getTranslationsForCatalog"

const NAME = "{name}"
const NAME_REPLACE_RE = /{name}/g
const LOCALE = "{locale}"
const LOCALE_REPLACE_RE = /{locale}/g
const LOCALE_SUFFIX_RE = /\{locale\}.*$/
const PATHSEP = "/" // force posix everywhere

type MessageOrigin = [filename: string, line?: number]

export type ExtractedMessageType = {
  message?: string
  origin?: MessageOrigin[]
  comments?: string[]
  extractedComments?: string[]
  obsolete?: boolean
  flags?: string[]
  context?: string
}

export type MessageType = ExtractedMessageType & {
  translation: string
}

export type ExtractedCatalogType = {
  [msgId: string]: ExtractedMessageType
}

export type CatalogType = {
  [msgId: string]: MessageType
}

export type AllCatalogsType = {
  [locale: string]: CatalogType
}

export type MakeOptions = CliExtractOptions & {
  orderBy?: OrderBy
}

export type MakeTemplateOptions = CliExtractTemplateOptions & {
  orderBy?: OrderBy
}

export type MergeOptions = {
  overwrite: boolean
  files?: string[]
}

export type CatalogProps = {
  name?: string
  path: string
  include: Array<string>
  exclude?: Array<string>
}

function mkdirp(dir: string) {
  try {
    fs.mkdirSync(dir, {
      recursive: true,
    })
  } catch (err) {
    if ((err as any).code != "EEXIST") {
      throw err
    }
  }
}

export class Catalog {
  name?: string
  path: string
  include: Array<string>
  exclude: Array<string>
  format: CatalogFormatter

  constructor(
    { name, path, include, exclude = [] }: CatalogProps,
    public config: LinguiConfigNormalized
  ) {
    this.name = name
    this.path = normalizeRelativePath(path)
    this.include = include.map(normalizeRelativePath)
    this.exclude = [this.localeDir, ...exclude.map(normalizeRelativePath)]
    this.format = getFormat(config.format)
  }

  async make(options: MakeOptions): Promise<AllCatalogsType | false> {
    const nextCatalog = await this.collect({ files: options.files })
    if (!nextCatalog) return false
    const prevCatalogs = this.readAll()

    const catalogs = this.merge(prevCatalogs, nextCatalog, {
      overwrite: options.overwrite,
      files: options.files,
    })

    // Map over all locales and post-process each catalog
    const cleanAndSort = R.map(
      R.pipe(
        // Clean obsolete messages
        (options.clean ? cleanObsolete : R.identity) as any,
        // Sort messages
        order(options.orderBy)
      )
    ) as unknown as (catalog: AllCatalogsType) => AllCatalogsType

    const sortedCatalogs = cleanAndSort(catalogs)

    if (options.locale) {
      this.write(options.locale, sortedCatalogs[options.locale])
    } else {
      this.writeAll(sortedCatalogs)
    }

    return sortedCatalogs
  }

  async makeTemplate(
    options: MakeTemplateOptions
  ): Promise<CatalogType | false> {
    const catalog = await this.collect({ files: options.files })
    if (!catalog) return false
    const sorted = order<CatalogType>(options.orderBy)(catalog as CatalogType)

    this.writeTemplate(sorted)
    return sorted
  }

  /**
   * Collect messages from source paths. Return a raw message catalog as JSON.
   */
  async collect(
    options: { files?: string[] } = {}
  ): Promise<ExtractedCatalogType | undefined> {
    const messages: ExtractedCatalogType = {}

    let paths = this.sourcePaths
    if (options.files) {
      options.files = options.files.map((p) => normalize(p, false))
      const regex = new RegExp(options.files.join("|"), "i")
      paths = paths.filter((path: string) => regex.test(path))
    }

    let catalogSuccess = true
    for (let filename of paths) {
      const fileSuccess = await extract(
        filename,
        (next: ExtractedMessage) => {
          if (!messages[next.id]) {
            messages[next.id] = {
              message: next.message,
              context: next.context,
              extractedComments: [],
              origin: [],
            }
          }

          const prev = messages[next.id]

          // there might be a case when filename was not mapped from sourcemaps
          const filename = next.origin[0]
            ? path
                .relative(this.config.rootDir, next.origin[0])
                .replace(/\\/g, "/")
            : ""

          const origin: MessageOrigin = [filename, next.origin[1]]

          if (prev.message && next.message && prev.message !== next.message) {
            throw new Error(
              `Encountered different default translations for message ${chalk.yellow(
                next.id
              )}` +
                `\n${chalk.yellow(prettyOrigin(prev.origin))} ${prev.message}` +
                `\n${chalk.yellow(prettyOrigin([origin]))} ${next.message}`
            )
          }

          messages[next.id] = {
            ...prev,
            extractedComments: next.comment
              ? [...prev.extractedComments, next.comment]
              : prev.extractedComments,
            origin: [...prev.origin, [filename, next.origin[1]]],
          }
        },
        this.config,
        {
          extractors: this.config.extractors as ExtractorType[],
        }
      )
      catalogSuccess &&= fileSuccess
    }

    if (!catalogSuccess) return undefined

    return messages
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
          ? nextCatalog[key].message || key
          : prevCatalog[key].translation

        return {
          [key]: {
            translation,
            ...R.omit(["obsolete, translation"], nextCatalog[key]),
          },
        }
      })

      // Mark all remaining translations as obsolete
      // Only if *options.files* is not provided
      const obsoleteMessages = obsoleteKeys.map((key) => ({
        [key]: {
          ...prevCatalog[key],
          obsolete: options.files ? false : true,
        },
      }))

      return R.mergeAll([newMessages, ...mergedMessages, ...obsoleteMessages])
    }, prevCatalogs)
  }

  getTranslations(locale: string, options: GetTranslationsOptions) {
    return getTranslationsForCatalog(this, locale, options)
  }

  write(
    locale: string,
    messages: CatalogType
  ): [created: boolean, filename: string] {
    const filename =
      this.path.replace(LOCALE_REPLACE_RE, locale) +
      this.format.catalogExtension

    const created = !fs.existsSync(filename)
    const basedir = path.dirname(filename)

    mkdirp(basedir)

    const options = { ...this.config.formatOptions, locale }

    this.format.write(filename, messages, options)
    return [created, filename]
  }

  writeAll(catalogs: AllCatalogsType): void {
    this.locales.forEach((locale) => this.write(locale, catalogs[locale]))
  }

  writeTemplate(messages: CatalogType) {
    const filename = this.templateFile
    const basedir = path.dirname(filename)
    mkdirp(basedir)
    const options: CatalogFormatOptionsInternal = {
      ...this.config.formatOptions,
      locale: undefined,
    }
    this.format.write(filename, messages, options)
  }

  writeCompiled(
    locale: string,
    compiledCatalog: string,
    namespace?: CompiledCatalogNamespace
  ) {
    let ext: string
    if (namespace === "es") {
      ext = "mjs"
    } else if (namespace === "ts") {
      ext = "ts"
    } else {
      ext = "js"
    }

    const filename = `${this.path.replace(LOCALE_REPLACE_RE, locale)}.${ext}`

    const basedir = path.dirname(filename)
    mkdirp(basedir)
    fs.writeFileSync(filename, compiledCatalog)
    return filename
  }

  read(locale: string) {
    const filename =
      this.path.replace(LOCALE_REPLACE_RE, locale) +
      this.format.catalogExtension

    if (!fs.existsSync(filename)) return null
    return this.format.read(filename)
  }

  readAll(): AllCatalogsType {
    return R.mergeAll(
      this.locales.map((locale) => ({
        [locale]: this.read(locale),
      }))
    ) as AllCatalogsType
  }

  readTemplate(): CatalogType {
    const filename = this.templateFile
    if (!fs.existsSync(filename)) return null
    return this.format.read(filename)
  }

  get sourcePaths() {
    const includeGlobs = this.include.map((includePath) => {
      const isDir =
        fs.existsSync(includePath) && fs.lstatSync(includePath).isDirectory()
      /**
       * glob library results from absolute patterns such as /foo/* are mounted onto the root setting using path.join.
       * On windows, this will by default result in /foo/* matching C:\foo\bar.txt.
       */
      return isDir
        ? normalize(
            path.resolve(
              process.cwd(),
              includePath === "/" ? "" : includePath,
              "**/*.*"
            )
          )
        : includePath
    })

    const patterns =
      includeGlobs.length > 1 ? `{${includeGlobs.join(",")}}` : includeGlobs[0]
    return glob.sync(patterns, { ignore: this.exclude, mark: true })
  }

  get templateFile() {
    const ext = this.format.templateExtension || this.format.catalogExtension
    return this.path.replace(LOCALE_SUFFIX_RE, "messages" + ext)
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
export function getCatalogs(config: LinguiConfigNormalized): Catalog[] {
  const catalogsConfig = config.catalogs
  const catalogs: Catalog[] = []

  catalogsConfig.forEach((catalog) => {
    // Validate that `catalogPath` doesn't end with trailing slash
    if (catalog.path.endsWith(PATHSEP)) {
      const extension = getFormat(config.format).catalogExtension
      const correctPath = catalog.path.slice(0, -1)
      const examplePath =
        correctPath.replace(
          LOCALE_REPLACE_RE,
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

    const patterns = include.map((path) => path.replace(NAME_REPLACE_RE, "*"))
    const candidates = glob.sync(
      patterns.length > 1 ? `{${patterns.join(",")}}` : patterns[0],
      {
        ignore: exclude,
        mark: true,
      }
    )

    candidates.forEach((catalogDir) => {
      const name = path.basename(catalogDir)
      catalogs.push(
        new Catalog(
          {
            name,
            path: normalizeRelativePath(
              catalog.path.replace(NAME_REPLACE_RE, name)
            ),
            include: include.map((path) => path.replace(NAME_REPLACE_RE, name)),
            exclude: exclude.map((path) => path.replace(NAME_REPLACE_RE, name)),
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
    const catalogGlob = catalogFile.replace(LOCALE_REPLACE_RE, "*")
    const match = micromatch.capture(
      normalizeRelativePath(path.relative(catalog.config.rootDir, catalogGlob)),
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
export function getCatalogForMerge(config: LinguiConfigNormalized) {
  const catalogConfig = config

  if (catalogConfig.catalogsMergePath.endsWith(PATHSEP)) {
    const extension = getFormat(config.format).catalogExtension
    const correctPath = catalogConfig.catalogsMergePath.slice(0, -1)
    const examplePath =
      correctPath.replace(
        LOCALE_REPLACE_RE,
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

  const isDir =
    fs.existsSync(sourcePath) && fs.lstatSync(sourcePath).isDirectory()
  return (
    normalize(path.relative(process.cwd(), sourcePath), false) +
    (isDir ? "/" : "")
  )
}

export const cleanObsolete = R.filter(
  (message: ExtractedMessageType) => !message.obsolete
)

export function order<T extends ExtractedCatalogType>(
  by: OrderBy
): (catalog: T) => T {
  return {
    messageId: orderByMessageId,
    origin: orderByOrigin,
  }[by]
}

/**
 * Object keys are in the same order as they were created
 * https://stackoverflow.com/a/31102605/1535540
 */
export function orderByMessageId<T extends ExtractedCatalogType>(
  messages: T
): T {
  return Object.keys(messages)
    .sort()
    .reduce((acc, key) => {
      ;(acc as any)[key] = messages[key]
      return acc
    }, {} as T)
}

export function orderByOrigin<T extends ExtractedCatalogType>(messages: T): T {
  function getFirstOrigin(messageKey: string) {
    const sortedOrigins = messages[messageKey].origin.sort((a, b) => {
      if (a[0] < b[0]) return -1
      if (a[0] > b[0]) return 1
      return 0
    })
    return sortedOrigins[0]
  }

  return Object.keys(messages)
    .sort((a, b) => {
      const [aFile, aLineNumber] = getFirstOrigin(a)
      const [bFile, bLineNumber] = getFirstOrigin(b)

      if (aFile < bFile) return -1
      if (aFile > bFile) return 1

      if (aLineNumber < bLineNumber) return -1
      if (aLineNumber > bLineNumber) return 1

      return 0
    })
    .reduce((acc, key) => {
      ;(acc as any)[key] = messages[key]
      return acc
    }, {} as T)
}
