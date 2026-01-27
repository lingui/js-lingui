import fs from "fs"
import path from "path"
import { globSync } from "glob"
import normalize from "normalize-path"

import {
  LinguiConfigNormalized,
  MessageType,
  OrderBy,
  OrderByFn,
} from "@lingui/conf"

import { FormatterWrapper } from "./formats/index.js"
import { CompiledCatalogNamespace } from "./compile.js"
import {
  getTranslationsForCatalog,
  GetTranslationsOptions,
} from "./catalog/getTranslationsForCatalog.js"
import { mergeCatalog } from "./catalog/mergeCatalog.js"
import {
  extractFromFiles,
  extractFromFilesWithWorkerPool,
} from "./catalog/extractFromFiles.js"
import {
  isDirectory,
  makePathRegexSafe,
  normalizeRelativePath,
  replacePlaceholders,
  writeFile,
} from "./utils.js"
import { AllCatalogsType, CatalogType, ExtractedCatalogType } from "./types.js"
import { ExtractWorkerPool } from "./extractWorkerPool.js"

const LOCALE = "{locale}"
const LOCALE_SUFFIX_RE = /\{locale\}.*$/

export type MakeOptions = {
  files?: string[]
  clean: boolean
  overwrite: boolean
  locale?: string[]
  orderBy: OrderBy
  workerPool?: ExtractWorkerPool
}

export type MakeTemplateOptions = {
  files?: string[]
  orderBy: OrderBy
  workerPool?: ExtractWorkerPool
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
  templateFile: string

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
    const [nextCatalog, prevCatalogs] = await Promise.all([
      this.collect({ files: options.files, workerPool: options.workerPool }),
      this.readAll(),
    ])

    if (!nextCatalog) return false

    const catalogs = this.merge(prevCatalogs, nextCatalog, {
      overwrite: options.overwrite,
      files: options.files,
    })

    // Map over all locales and post-process each catalog
    const sortedCatalogs = Object.fromEntries(
      Object.entries(catalogs).map(([locale, catalog]) => {
        if (options.clean) {
          catalog = cleanObsolete(catalog)
        }

        catalog = order(options.orderBy, catalog)

        return [locale, catalog]
      })
    ) as AllCatalogsType

    const locales = options.locale ? options.locale : this.locales
    await Promise.all(
      locales.map((locale) => this.write(locale, sortedCatalogs[locale]!))
    )

    return sortedCatalogs
  }

  async makeTemplate(
    options: MakeTemplateOptions
  ): Promise<CatalogType | false> {
    const catalog = await this.collect({
      files: options.files,
      workerPool: options.workerPool,
    })
    if (!catalog) return false
    const sorted = order(options.orderBy, catalog)

    await this.writeTemplate(sorted)
    return sorted
  }

  /**
   * Collect messages from source paths. Return a raw message catalog as JSON.
   */
  async collect(
    options: { files?: string[]; workerPool?: ExtractWorkerPool } = {}
  ): Promise<ExtractedCatalogType | undefined> {
    let paths = this.sourcePaths
    if (options.files) {
      options.files = options.files.map((p) =>
        makePathRegexSafe(normalize(p, false))
      )

      const regex = new RegExp(options.files.join("|"), "i")
      paths = paths.filter((path: string) => regex.test(normalize(path)))
    }

    if (options.workerPool) {
      return await extractFromFilesWithWorkerPool(
        options.workerPool,
        paths,
        this.config
      )
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
    return Object.fromEntries(
      Object.entries(prevCatalogs).map(([locale, prevCatalog]) => [
        locale,
        mergeCatalog(
          prevCatalog,
          nextCatalog,
          this.config.sourceLocale === locale,
          options
        ),
      ])
    )
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
    await this.format.write(filename, messages)
  }

  async read(locale: string): Promise<CatalogType | undefined> {
    return await this.format.read(this.getFilename(locale), locale)
  }

  async readAll(locales: string[] = this.locales): Promise<AllCatalogsType> {
    const res: AllCatalogsType = {}

    await Promise.all(
      locales.map(async (locale) => {
        const catalog = await this.read(locale)

        if (catalog) {
          res[locale] = catalog
        }
      })
    )

    // statement above will save locales in object in undetermined order
    // resort here to have keys order the same as in locales definition
    return this.locales.reduce<AllCatalogsType>((acc, locale: string) => {
      acc[locale] = res[locale]!
      return acc
    }, {})
  }

  async readTemplate(): Promise<CatalogType | undefined> {
    return await this.format.read(this.templateFile, undefined)
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

export function cleanObsolete<T extends CatalogType>(messages: T): T {
  return Object.fromEntries(
    Object.entries(messages).filter(([, message]) => !message.obsolete)
  ) as T
}

export function order<T extends CatalogType>(by: OrderBy, catalog: T): T {
  const orderByFn =
    typeof by === "function"
      ? by
      : {
          messageId: orderByMessageId,
          message: orderByMessage,
          origin: orderByOrigin,
        }[by]

  return Object.keys(catalog)
    .sort((a, b) => {
      return orderByFn(
        { messageId: a, entry: catalog[a]! },
        { messageId: b, entry: catalog[b]! }
      )
    })
    .reduce((acc, key) => {
      ;(acc as any)[key] = catalog[key]
      return acc
    }, {} as T)
}
/**
 * Object keys are in the same order as they were created
 * https://stackoverflow.com/a/31102605/1535540
 */
const orderByMessageId: OrderByFn = (a, b) => {
  return a.messageId.localeCompare(b.messageId)
}

const orderByOrigin: OrderByFn = (a, b) => {
  if (!a.entry.origin || !b.entry.origin) {
    return 0
  }

  function getFirstOrigin(entry: MessageType) {
    const sortedOrigins = entry.origin!.sort((a, b) => {
      if (a[0] < b[0]) return -1
      if (a[0] > b[0]) return 1
      return 0
    })
    return sortedOrigins[0]
  }

  const [aFile, aLineNumber] = getFirstOrigin(a.entry)!
  const [bFile, bLineNumber] = getFirstOrigin(b.entry)!

  if (aFile < bFile) return -1
  if (aFile > bFile) return 1

  if (aLineNumber! < bLineNumber!) return -1
  if (aLineNumber! > bLineNumber!) return 1

  return 0
}

export async function writeCompiled(
  path: string,
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

  const filename = `${replacePlaceholders(path, { locale })}.${ext}`
  await writeFile(filename, compiledCatalog)
  return filename
}

export const orderByMessage: OrderByFn = (a, b) => {
  // hardcoded en-US locale to have consistent sorting
  // @see https://github.com/lingui/js-lingui/pull/1808
  const collator = new Intl.Collator("en-US")

  const aMsg = a.entry.message || ""
  const bMsg = b.entry.message || ""
  const aCtxt = a.entry.context || ""
  const bCtxt = b.entry.context || ""
  return collator.compare(aMsg, bMsg) || collator.compare(aCtxt, bCtxt)
}
