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
  placeholders?: Record<string, string[]>
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
  placeholders?: Record<string, string>
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

type ModuleSource = readonly [module: string, specifier?: string]

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
  /**
   * The catalogs configuration defines the location of message catalogs and specifies
   * which files are included when the extract command scans for messages.
   *
   * https://lingui.dev/ref/conf#catalogs
   */
  catalogs?: CatalogConfig[]
  compileNamespace?: "es" | "ts" | "cjs" | string
  /**
   * Specify additional options used to parse source files when extracting messages.
   */
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
  /**
   * Specifies custom message extractor implementations
   *
   * https://lingui.dev/guides/custom-extractor
   */
  extractors?: ExtractorType[]
  prevFormat?: CatalogFormat
  /**
   * Message catalog format. The po formatter is used by default. Other formatters are available as separate packages.
   *
   * @default "po"
   */
  format?: CatalogFormat | CatalogFormatter
  formatOptions?: CatalogFormatOptions
  /**
   * The locale tags used in the project. The `extract` and `compile` commands write a catalog for each locale specified.
   *
   * Each locale should be a valid BCP-47 code:
   * @example
   *
   * ```js
   * locales: ["en", "cs"]
   * ```
   */
  locales: string[]
  /**
   * Define the path where translated catalogs are merged into a single file per locale during the compile process.
   *
   * https://lingui.dev/ref/conf#catalogsmergepath
   */
  catalogsMergePath?: string
  /**
   * Order of messages in catalog
   *
   * @default "message"
   */
  orderBy?: OrderBy
  /**
   * Locale used for pseudolocalization. For example, when you set `pseudoLocale: "en"`, all messages in the en catalog will be pseudo-localized.
   * The locale must be included in the locales config.
   *
   * https://lingui.dev/guides/pseudolocalization
   */
  pseudoLocale?: string
  /**
   * This is the directory where the Lingui CLI scans for messages in your source files during the extraction process.
   *
   * Note that using <rootDir> as a string token in any other path-based config settings will refer back to this value.
   *
   * @defaul: The root of the directory containing your Lingui configuration file or the package.json.
   */
  rootDir?: string
  /**
   * This setting specifies the module path for the exported `i18n` object and `Trans` component.
   *
   * @example
   *
   * ```js
   * {
   *   "runtimeConfigModule": {
   *     "Trans": ["./myTrans", "Trans"],
   *     "useLingui": ["./myUseLingui", "useLingui"]
   *     "i18n": ["./nyI18n", "I18n"]
   *   }
   * }
   * ```
   */
  runtimeConfigModule?:
    | ModuleSource
    | Partial<Record<"useLingui" | "Trans" | "i18n", ModuleSource>>
  /**
   * Specifies the default language of message IDs in your source files.
   *
   * The catalog for sourceLocale doesn't need actual translations since message IDs are used as-is by default.
   * However, you can still override any message ID by providing a custom translation.
   *
   * The main difference between `sourceLocale` and `fallbackLocales` is their purpose: `sourceLocale` defines the language used for message IDs,
   * while `fallbackLocales` provides alternative translations when specific messages are missing for a particular locale.
   */
  sourceLocale?: string
  service?: CatalogService
  /**
   * Allow you to set macro options
   */
  macro?: {
    /**
     * Allows customizing the Core Macro package name that the Lingui macro detects.
     *
     * ```ts
     * // lingui.config
     * {
     *   macro: {
     *    corePackage: ['@lingui/myMacro']
     *   }
     * }
     *
     * // app.tsx
     * import { msg } from '@lingui/myMacro'
     *
     * msg`Hello` // <-- would be correctly picked up by macro
     * ```
     *
     * @default ["@lingui/macro", "@lingui/core/macro"]
     */
    corePackage?: string[]
    /**
     * Allows customizing the JSX Macro package name that the Lingui macro detects.
     *
     * ```ts
     * // lingui.config
     * {
     *   macro: {
     *     jsxPackage: ["@lingui/myMacro"];
     *   }
     * }
     *
     * // app.tsx
     * import { Trans } from '@lingui/myMacro'
     *
     * <Trans>Hello</Trans> // <-- would be correctly picked up by macro
     * ```
     *
     * @default ["@lingui/macro", "@lingui/react/macro"]
     */
    jsxPackage?: string[]
  }
  experimental?: {
    extractor?: ExperimentalExtractorOptions
    /**
     * Enable multi-threaded.
     *
     * @default false
     */
    multiThread?: boolean
  }
}

type ModuleSourceNormalized = readonly [module: string, specifier: string]

export type LinguiConfigNormalized = Omit<
  LinguiConfig,
  "runtimeConfigModule"
> & {
  fallbackLocales?: FallbackLocales
  runtimeConfigModule: {
    i18n: ModuleSourceNormalized
    useLingui: ModuleSourceNormalized
    Trans: ModuleSourceNormalized
  }
}
