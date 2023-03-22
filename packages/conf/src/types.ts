/**
 * @deprecated please pass formatter directly to `format`
 *
 * @example
 * ```js
 * // lingui.config.{js,ts}
 * import {formatter} from "@lingui/format-po"
 *
 * export default {
 *   [...]
 *   format: formatter({lineNumbers: false}),
 * }
 * ```
 */
export type CatalogFormat = "lingui" | "minimal" | "po" | "csv" | "po-gettext"

export type ExtractorCtx = {
  /**
   * Raw Sourcemaps object to mapping from.
   * Check the https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
   */
  sourceMaps?: any
  linguiConfig: LinguiConfigNormalized
}

type CatalogExtra = Record<string, unknown>
export type MessageOrigin = [filename: string, line?: number]
export type ExtractedMessageType<Extra = CatalogExtra> = {
  message?: string
  origin?: MessageOrigin[]
  comments?: string[]
  obsolete?: boolean
  context?: string
  /**
   * the generic field where
   * formatters can store additional data
   */
  extra?: Extra
}
export type MessageType<Extra = CatalogExtra> = ExtractedMessageType<Extra> & {
  translation: string
}
export type ExtractedCatalogType<Extra = CatalogExtra> = {
  [msgId: string]: ExtractedMessageType<Extra>
}
export type CatalogType<Extra = CatalogExtra> = {
  [msgId: string]: MessageType<Extra>
}

export type ExtractorType = {
  match(filename: string): boolean
  extract(
    filename: string,
    code: string,
    onMessageExtracted: (msg: ExtractedMessage) => void,
    ctx?: ExtractorCtx
  ): Promise<void> | void
}

export type CatalogFormatter = {
  catalogExtension: string
  /**
   * Set extension used when extract to template
   * Omit if the extension is the same as catalogExtension
   */
  templateExtension?: string
  parse(
    content: string,
    ctx: { locale: string | null; sourceLocale: string; filename: string }
  ): Promise<CatalogType> | CatalogType
  serialize(
    catalog: CatalogType,
    ctx: {
      locale: string | null
      sourceLocale: string
      filename: string
      existing: string | null
    }
  ): Promise<string> | string
}

export type ExtractedMessage = {
  id: string

  message?: string
  context?: string
  origin?: [filename: string, line: number, column?: number]

  comment?: string
}

export type CatalogFormatOptions = {
  origins?: boolean
  lineNumbers?: boolean
  disableSelectWarning?: boolean
}

export type OrderBy = "messageId" | "message" | "origin"

export type CatalogConfig = {
  name?: string
  path: string
  include: string[]
  exclude?: string[]
}

type LocaleObject = {
  [locale: string]: string[] | string
  default?: string
}

export type FallbackLocales = LocaleObject

type ModuleSource = [string, string?]

type CatalogService = {
  name: string
  apiKey: string
}

export type ExperimentalExtractorOptions = {
  /**
   * Entries to start extracting from.
   * Each separate resolved entry would create a separate catalog.
   *
   * Example for MPA application like Next.js
   * ```
   * <rootDir>/pages/**\/*.ts
   * <rootDir>/pages/**\/*.page.ts
   * ```
   *
   * With this config you would have a separate
   * catalog for every page file in your app.
   */
  entries: string[]

  /**
   * Explicitly include some dependency for extraction.
   * For example, you can include all monorepo's packages as
   * ["@mycompany/"]
   */
  includeDeps?: string[]

  /**
   * By default all dependencies from package.json would be ecxluded from analyzing.
   * If something was not properly discovered you can add it here.
   *
   * Note: it automatically matches also sub imports
   *
   * "next" would match "next" and "next/head"
   */
  excludeDeps?: string[]

  /**
   * svg, jpg and other files which might be imported in application should be exluded from analysis.
   * By default extractor provides a comprehensive list of extensions. If you feel like somthing is missing in this list please fill an issue on GitHub
   *
   * NOTE: changing this param will override default list of extensions.
   */
  excludeExtensions?: string[]

  /**
   * output path for extracted catalogs.
   *
   * Supported placeholders for entry: /pages/about/index.page.ts
   *  - {entryName} = index.page
   *  - {locale} = en
   *  - {entryDir} = pages/about/
   *
   * Examples:
   *
   * ```
   * <rootDir>/locales/{entryName}.{locale} -> /locales/index.page/en.po
   * <rootDir>/{entryDir}/locales/{locale} -> /pages/about/locales/en.po
   * ```
   */
  output: string

  resolveEsbuildOptions?: (options: any) => any
}

export type LinguiConfig = {
  catalogs?: CatalogConfig[]
  compileNamespace?: "es" | "ts" | "cjs" | string
  extractorParserOptions?: {
    /**
     * default false
     *
     * By default, standard decorators (Stage3) are applied for TS files
     * Enable this if you want to use TypesScript's experimental decorators.
     */
    tsExperimentalDecorators?: boolean
    /**
     * Enable if you use flow. This will apply Flow syntax to js files
     */
    flow?: boolean
  }
  compilerBabelOptions?: any
  fallbackLocales?: FallbackLocales | false
  extractors?: (string | ExtractorType)[]
  prevFormat?: CatalogFormat
  localeDir?: string
  format?: CatalogFormat | CatalogFormatter
  formatOptions?: CatalogFormatOptions
  locales: string[]
  catalogsMergePath?: string
  orderBy?: OrderBy
  pseudoLocale?: string
  rootDir?: string
  runtimeConfigModule?: ModuleSource | { [symbolName: string]: ModuleSource }
  sourceLocale?: string
  service?: CatalogService
  experimental?: {
    extractor?: ExperimentalExtractorOptions
  }
}

export type LinguiConfigNormalized = Omit<
  LinguiConfig,
  "runtimeConfigModule"
> & {
  fallbackLocales?: FallbackLocales
  runtimeConfigModule: {
    i18nImportModule: string
    i18nImportName: string
    TransImportModule: string
    TransImportName: string
  }
}
