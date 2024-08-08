import fs from "fs"
import path from "path"
import * as R from "ramda"
import { globSync } from "glob"
import normalize from "normalize-path"

import { LinguiConfigNormalized, OrderBy } from "@lingui/conf"

import { FormatterWrapper } from "./formats"
import { CliExtractOptions } from "../lingui-extract"
import { CliExtractTemplateOptions } from "../lingui-extract-template"
import { CompiledCatalogNamespace } from "./compile"
import {
  getTranslationsForCatalog,
  GetTranslationsOptions,
} from "./catalog/getTranslationsForCatalog"
import { mergeCatalog } from "./catalog/mergeCatalog"
import { extractFromFiles } from "./catalog/extractFromFiles"
import {
  isDirectory,
  normalizeRelativePath,
  replacePlaceholders,
  writeFile,
} from "./utils"
import {
  AllCatalogsType,
  CatalogType,
  ExtractedCatalogType,
  ExtractedMessageType,
} from "./types"

const LOCALE = "{locale}"
const LOCALE_SUFFIX_RE = /\{locale\}.*$/

export type MakeOptions = CliExtractOptions & {
  orderBy?: OrderBy
}

export type MakeTemplateOptions = CliExtractTemplateOptions & {
  orderBy?: OrderBy
}

export type MergeOptions = {
  overwrite?: boolean
  files?: string[]
}

export type CatalogProps = {
  name?: string
  path: string
  include: Array<string>
  exclude?: Array<string>
  templatePath?: string
  format: FormatterWrapper
}

export class Catalog {
  name?: string
  path: string
  include: Array<string>
  exclude: Array<string>
  format: FormatterWrapper
  templateFile?: string

  constructor(
    { name, path, include, templatePath, format, exclude = [] }: CatalogProps,
    public config: LinguiConfigNormalized
  ) {
    this.name = name
    this.path = normalizeRelativePath(path)
    this.include = include.map(normalizeRelativePath)
    this.exclude = [this.localeDir, ...exclude.map(normalizeRelativePath)]
    this.format = format
    this.templateFile =
      templatePath ||
      getTemplatePath(this.format.getTemplateExtension(), this.path)
  }

  getFilename(locale: string): string {
    return (
      replacePlaceholders(this.path, { locale }) +
      this.format.getCatalogExtension()
    )
  }

  async make(options: MakeOptions): Promise<AllCatalogsType | false> {
    const nextCatalog = await this.collect({ files: options.files })
    if (!nextCatalog) return false
    const prevCatalogs = await this.readAll()

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

    const locales = options.locale ? options.locale : this.locales
    await Promise.all(
      locales.map((locale) => this.write(locale, sortedCatalogs[locale]))
    )

    return sortedCatalogs
  }

  async makeTemplate(
    options: MakeTemplateOptions
  ): Promise<CatalogType | false> {
    const catalog = await this.collect({ files: options.files })
    if (!catalog) return false
    const sorted = order<CatalogType>(options.orderBy)(catalog as CatalogType)

    await this.writeTemplate(sorted)
    return sorted
  }

  /**
   * Collect messages from source paths. Return a raw message catalog as JSON.
   */
  async collect(
    options: { files?: string[] } = {}
  ): Promise<ExtractedCatalogType | undefined> {
    let paths = this.sourcePaths
    if (options.files) {
      options.files = options.files.map((p) => normalize(p, false))
      const regex = new RegExp(options.files.join("|"), "i")
      paths = paths.filter((path: string) => regex.test(path))
    }

    return await extractFromFiles(paths, this.config)
  }

  /*
   *
   * prevCatalogs - map of message catalogs in all available languages with translations
   * nextCatalog - language-agnostic catalog with collected messages
   *
   * Note: if a catalog in prevCatalogs is null it means the language is available, but
   * no previous catalog was generated (usually first run).
   *
   * Orthogonal use-cases
   * --------------------
   *
   * Message IDs:
   * - auto-generated IDs: message is used as a key, `defaults` is not set
   * - custom IDs: message is used as `defaults`, custom ID as a key
   *
   * Source locale (defined by `sourceLocale` in config):
   * - catalog for `sourceLocale`: initially, `translation` is prefilled with `defaults`
   *   (for custom IDs) or `key` (for auto-generated IDs)
   * - all other languages: translation is kept empty
   */
  merge(
    prevCatalogs: AllCatalogsType,
    nextCatalog: ExtractedCatalogType,
    options: MergeOptions
  ) {
    return R.mapObjIndexed((prevCatalog, locale) => {
      return mergeCatalog(
        prevCatalog,
        nextCatalog,
        this.config.sourceLocale === locale,
        options
      )
    }, prevCatalogs)
  }

  async getTranslations(locale: string, options: GetTranslationsOptions) {
    return await getTranslationsForCatalog(this, locale, options)
  }

  async write(
    locale: string,
    messages: CatalogType
  ): Promise<[created: boolean, filename: string]> {
    const filename = this.getFilename(locale)

    const created = !fs.existsSync(filename)

    await this.format.write(filename, messages, locale)
    return [created, filename]
  }

  async writeTemplate(messages: CatalogType): Promise<void> {
    const filename = this.templateFile
    await this.format.write(filename, messages, undefined)
  }

  async writeCompiled(
    locale: string,
    compiledCatalog: string,
    namespace?: CompiledCatalogNamespace
  ) {
    let ext: string
    switch (namespace) {
      case "es":
        ext = "mjs"
        break
      case "ts":
      case "json":
        ext = namespace
        break
      default:
        ext = "js"
    }

    const filename = `${replacePlaceholders(this.path, { locale })}.${ext}`
    await writeFile(filename, compiledCatalog)
    return filename
  }

  async read(locale: string): Promise<CatalogType> {
    return await this.format.read(this.getFilename(locale), locale)
  }

  async readAll(): Promise<AllCatalogsType> {
    const res: AllCatalogsType = {}

    await Promise.all(
      this.locales.map(
        async (locale) => (res[locale] = await this.read(locale))
      )
    )

    // statement above will save locales in object in undetermined order
    // resort here to have keys order the same as in locales definition
    return this.locales.reduce<AllCatalogsType>((acc, locale: string) => {
      acc[locale] = res[locale]
      return acc
    }, {})
  }

  async readTemplate(): Promise<CatalogType> {
    const filename = this.templateFile
    return await this.format.read(filename, undefined)
  }

  get sourcePaths() {
    const includeGlobs = this.include.map((includePath) => {
      const isDir = isDirectory(includePath)
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

    return globSync(includeGlobs, { ignore: this.exclude, mark: true })
  }

  get localeDir() {
    const localePatternIndex = this.path.indexOf(LOCALE)
    if (localePatternIndex === -1) {
      throw Error(`Invalid catalog path: ${LOCALE} variable is missing`)
    }
    return this.path.substring(0, localePatternIndex)
  }

  get locales() {
    return this.config.locales
  }
}

function getTemplatePath(ext: string, path: string) {
  return path.replace(LOCALE_SUFFIX_RE, "messages" + ext)
}

export const cleanObsolete = R.filter(
  (message: ExtractedMessageType) => !message.obsolete
)

export function order<T extends ExtractedCatalogType>(
  by: OrderBy
): (catalog: T) => T {
  return {
    messageId: orderByMessageId,
    message: orderByMessage,
    origin: orderByOrigin,
  }[by]
}

/**
 * Object keys are in the same order as they were created
 * https://stackoverflow.com/a/31102605/1535540
 */
function orderByMessageId<T extends ExtractedCatalogType>(messages: T): T {
  return Object.keys(messages)
    .sort()
    .reduce((acc, key) => {
      ;(acc as any)[key] = messages[key]
      return acc
    }, {} as T)
}

function orderByOrigin<T extends ExtractedCatalogType>(messages: T): T {
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

export function orderByMessage<T extends ExtractedCatalogType>(messages: T): T {
  // hardcoded en-US locale to have consistent sorting
  // @see https://github.com/lingui/js-lingui/pull/1808
  const collator = new Intl.Collator("en-US")

  return Object.keys(messages)
    .sort((a, b) => {
      const aMsg = messages[a].message || ""
      const bMsg = messages[b].message || ""
      return collator.compare(aMsg, bMsg)
    })
    .reduce((acc, key) => {
      ;(acc as any)[key] = messages[key]
      return acc
    }, {} as T)
}
