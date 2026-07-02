import { defaultConfig } from "./makeConfig"

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
export type ExtractedMessageType = {
  message?: string
  origin: MessageOrigin[]
  comments: string[]
  context?: string
  placeholders: Record<string, string[]>
}
export type MessageType<Extra = CatalogExtra> = {
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
  translation?: string
}
export type ExtractedCatalogType = {
  [msgId: string]: ExtractedMessageType
}
export type CatalogType<Extra = CatalogExtra> = {
  [msgId: string]: MessageType<Extra>
}

/**
 * Per-file extractor that processes one file at a time.
 * The CLI reads file contents and calls `extract` for each file that `match` returns true for.
 */
export type PerFileExtractorType = {
  /**
   * Determine whether this extractor should handle the given file.
   */
  match(filename: string): boolean
  /**
   * Extract messages from a single file's source code.
   */
  extract(
    filename: string,
    code: string,
    onMessageExtracted: (msg: ExtractedMessage) => void,
    ctx: ExtractorCtx,
  ): Promise<void> | void
}

/**
 * Batch extractor that receives all matched file paths at once and handles
 * file I/O and parallelism internally.
 *
 * Files are matched using `match` and only those are passed to `extractFromFiles`.
 * The CLI does not read file contents or use worker pools for batch extractors.
 *
 * @experimental This type is experimental and may change in future versions.
 */
export type Experimental__BatchExtractorType = {
  /**
   * Determine whether this extractor should handle the given file.
   */
  match(filename: string): boolean
  /**
   * Extract messages from multiple files at once.
   * The extractor is responsible for reading file contents and managing concurrency.
   *
   * @param filenames - File paths that passed the `match` filter.
   * @param onMessageExtracted - Callback to emit each extracted message.
   * @param ctx - Extraction context containing the Lingui configuration.
   */
  extractFromFiles(
    filenames: string[],
    onMessageExtracted: (msg: ExtractedMessage) => void,
    ctx: ExtractorCtx,
  ): Promise<void>
}

export type ExtractorType =
  | PerFileExtractorType
  | Experimental__BatchExtractorType

export type CatalogFormatter = {
  catalogExtension: string
  /**
   * Set extension used when extract to template
   * Omit if the extension is the same as catalogExtension
   */
  templateExtension?: string
  parse(
    content: string,
    ctx: { locale: string | undefined; sourceLocale: string; filename: string },
  ): Promise<CatalogType> | CatalogType
  serialize(
    catalog: CatalogType,
    ctx: {
      locale: string | undefined
      sourceLocale: string
      filename: string
      existing: string | undefined
    },
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

export type OrderByFn = (
  a: {
    messageId: string
    entry: MessageType
  },
  b: {
    messageId: string
    entry: MessageType
  },
) => number
export type OrderBy = "messageId" | "message" | "origin" | OrderByFn

export type CatalogConfig = {
  name?: string
  path: string
  include: string[]
  exclude?: string[]
}

type LocaleObject =
  | Record<string, string[] | string>
  | (Record<string, string[] | string> & {
      default: string
    })

export type FallbackLocales = LocaleObject

type ModuleSource = readonly [module: string, specifier?: string]

type CatalogService = {
  name: string
  apiKey: string
}

/**
 * Describes a single output chunk produced by the bundler.
 */
export type BundleChunk = {
  /** Unique identifier for this chunk within the bundle (e.g. relative output path or fileName). */
  id: string
  /** Absolute or relative file path to the chunk on disk. */
  filePath: string
  /**
   * If this chunk is an entry chunk, the absolute file path of the source entry point.
   * Omit for shared/common chunks.
   */
  entryPoint?: string
  /** IDs of other chunks that this chunk imports (references to other chunks' `id` fields). */
  imports: string[]
}

/**
 * Result returned by a bundler after bundling entry points.
 *
 * Bundlers describe the chunk graph — the CLI handles traversal
 * to determine which entry points each shared chunk belongs to.
 */
export type BundleResult = {
  chunks: BundleChunk[]
}

/**
 * Pluggable bundler interface for the experimental extractor.
 * Implementations bundle entry points and return a chunk graph.
 */
export type ExperimentalExtractorBundler = {
  bundle(
    entryPoints: string[],
    outDir: string,
    linguiConfig: LinguiConfigNormalized,
  ): Promise<BundleResult>
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
   * List of package name patterns to include for extraction.
   *
   * For example, to include all packages from your monorepo:
   *
   * ["@mycompany"]
   *
   * By default, all imports that look like package imports are ignored.
   * This means imports that do not start with `/`, `./`, `../`, or `#`
   * (used for subpath imports). TypeScript path aliases are also ignored
   * because they look like package imports.
   *
   * Add here the packages you want to include.
   * @deprecated Use `bundler: createEsbuildBundler({ includeDeps: ... })` instead.
   */
  includeDeps?: string[]

  /**
   * svg, jpg and other files which might be imported in application should be excluded from analysis.
   * By default, extractor provides a comprehensive list of extensions. If you feel like something
   * is missing in this list please fill an issue on GitHub
   *
   * NOTE: changing this param will override default list of extensions.
   *
   * @deprecated Use `bundler: createEsbuildBundler({ excludeExtensions: ... })` instead.
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

  /**
   * Pluggable bundler for the experimental extractor.
   * If not provided, defaults to the built-in esbuild bundler.
   *
   * @example
   * ```ts
   * import { createEsbuildBundler } from "@lingui/cli/bundlers/esbuild"
   *
   * experimental: {
   *   extractor: {
   *     bundler: createEsbuildBundler({ resolveEsbuildOptions: (opts) => opts })
   *   }
   * }
   * ```
   */
  bundler?: ExperimentalExtractorBundler

  /**
   * @deprecated Use `bundler: createEsbuildBundler({ resolveEsbuildOptions: ... })` instead.
   */
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
   *
   * @deprecated please pass options directly to the extractor implementation
   *
   * @example
   * ```ts
   * import { createBabelExtractor } from '@lingui/cli/api/extractors/babel'
   *
   * export default {
   *   [...]
   *   extractors: [createBabelExtractor({parserOptions: { tsExperimentalDecorators: true }})],
   * }
   * ```
   * https://lingui.dev/guides/custom-extractor
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
   * Specifies custom message extractor implementations.
   *
   * Extractors can be either per-file (with `match` and `extract` methods)
   * or batch (with `extractFromFiles` method that receives all paths at once
   * and handles file I/O and parallelism internally).
   *
   * https://lingui.dev/guides/custom-extractor
   */
  extractors?: ExtractorType[]
  /**
   * Message catalog format. If not set, po formatter would be used.
   *
   * Other formatters are available as separate packages.
   *
   * If you want to set additional options for po formatter you need to
   * install it as a separate package and provide in config:
   *
   * @example
   * ```js
   * import {formatter} from "@lingui/format-po"
   *
   * export default {
   *   [...]
   *   format: formatter({lineNumbers: false}),
   * }
   * ```
   *
   */
  format?: CatalogFormatter
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
   * You can choose one of: `"messageId" | "message" | "origin"`.
   *
   * - `messageId` — Sorts by the message key. Not recommended if you use the source
   *   message as the key, as `messageId` is autogenerated and may lead to
   *   unexpected results.
   * - `message` — Sorts by the message text and its context. **Recommended**.
   *   Messages are ordered alphabetically.
   * - `origin` — Sorts by the location where the message was first defined.
   *
   * You can also provide a custom sorting function. See {@link OrderByFn} for the function signature.
   *
   * @default "message"
   */
  orderBy?: OrderBy
  /**
   * Locale used for pseudolocalization. For example, when you set `pseudoLocale: "en"`, all messages in the en catalog will be pseudo-localized.
   * The locale must be included in the locales config.
   *
   * You can either pass the locale as a string, or an object to additionally
   * configure the underlying [`pseudolocale`](https://github.com/MartinCerny-awin/pseudolocale)
   * library (e.g. to customize the prepended/appended markers or extend the string length).
   *
   * The string form is deprecated and will be removed in a future major release.
   * Use the object form (`{ locale: "pseudo" }`) instead.
   *
   * @example
   *
   * ```ts
   * // Simple form (deprecated)
   * pseudoLocale: "pseudo"
   *
   * // Extended form
   * pseudoLocale: { locale: "pseudo", prepend: "⟦ ", append: " ⟧", extend: 0.4 }
   * ```
   *
   * https://lingui.dev/guides/pseudolocalization
   */
  pseudoLocale?: DeprecatedPseudoLocaleString | PseudoLocaleConfig
  /**
   * This is the directory where the Lingui CLI scans for messages in your source files during the extraction process.
   *
   * Note that using <rootDir> as a string token in any other path-based config settings will refer back to this value.
   *
   * @default: The root of the directory containing your Lingui configuration file or the package.json.
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
     * @default [ "@lingui/core/macro"]
     */
    corePackage?: string[]
    /**
     * Allows customizing the JSX Macro package name that the Lingui macro detects.
     *
     * ```ts
     * // lingui.config
     * {
     *   macro: {
     *     jsxPackage: ["@lingui/myMacro"]
     *   }
     * }
     *
     * // app.tsx
     * import { Trans } from '@lingui/myMacro'
     *
     * <Trans>Hello</Trans> // <-- would be correctly picked up by macro
     * ```
     *
     * @default ["@lingui/react/macro"]
     */
    jsxPackage?: string[]
    /**
     * The JSX attribute name used to assign explicit placeholder names to JSX elements inside `<Trans>`.
     *
     * When set, the macro will read this attribute from JSX elements to use as the placeholder name
     * in the message string, and strip the attribute from the output.
     *
     * ```tsx
     * // lingui.config
     * {
     *   macro: {
     *     jsxPlaceholderAttribute: "_t"
     *   }
     * }
     *
     * // source
     * <Trans>Click <a _t="link" href="/">here</a></Trans>
     *
     * // extracted message: "Click <link>here</link>"
     * ```
     */
    jsxPlaceholderAttribute?: string
    /**
     * A mapping of JSX element tag names to default placeholder names.
     *
     * When a JSX element inside `<Trans>` matches a key in this map and does not have an explicit
     * placeholder attribute, the corresponding value is used as the placeholder name.
     *
     * ```tsx
     * // lingui.config
     * {
     *   macro: {
     *     jsxPlaceholderDefaults: { a: "link", em: "em" }
     *   }
     * }
     *
     * // source
     * <Trans>Click <a href="/">here</a> and <em>this</em></Trans>
     *
     * // extracted message: "Click <link>here</link> and <em>this</em>"
     * ```
     */
    jsxPlaceholderDefaults?: Record<string, string>
    /**
     * If defined, `idPrefix` will only be prepended to explicit IDs that
     * start with this leader string. The leader string is kept in the final ID.
     */
    idPrefixLeader?: string
    /**
     * Controls which JSX runtime semantics the Lingui JSX macro emit.
     *
     * @default undefined
     */
    jsxRuntime?: "react" | "solid"
  }
  experimental?: {
    extractor?: ExperimentalExtractorOptions
  }
}

/**
 * Subset of options accepted by the [`pseudolocale`](https://github.com/MartinCerny-awin/pseudolocale)
 * library that Lingui exposes through the {@link LinguiConfig.pseudoLocale} config.
 *
 * The delimiter related options are intentionally omitted because Lingui relies
 * on its own internal delimiter to protect HTML tags, ICU macros and variables.
 */
export type PseudoLocaleOptions = {
  /**
   * String prepended to the beginning of every pseudo-localized message.
   *
   * @default ""
   */
  prepend?: string
  /**
   * String appended to the end of every pseudo-localized message.
   *
   * @default ""
   */
  append?: string
  /**
   * Extends the width of the string by the given percentage (e.g. `0.3` adds 30%).
   * Useful to emulate languages that are longer than the source, such as German.
   *
   * @default 0
   */
  extend?: number
  /**
   * Replaces every (non-token) character with the given one. Handy to quickly
   * spot strings that were not extracted/translated.
   *
   * @default undefined
   */
  override?: string
}

/**
 * Legacy string form of {@link LinguiConfig.pseudoLocale}, where the value is
 * the pseudolocalization locale itself.
 *
 * @deprecated Use the object form ({@link PseudoLocaleConfig}, e.g. `{ locale: "pseudo" }`) instead.
 * The string form will be removed in a future major release.
 */
export type DeprecatedPseudoLocaleString = string

/**
 * Extended form of {@link LinguiConfig.pseudoLocale}, allowing the
 * pseudolocalization {@link PseudoLocaleOptions} to be configured alongside the locale.
 */
export type PseudoLocaleConfig = {
  /**
   * Locale used for pseudolocalization. The locale must be included in the `locales` config.
   */
  locale: string
} & PseudoLocaleOptions

/**
 * Normalized form of {@link LinguiConfig.pseudoLocale}. `makeConfig` expands both
 * the string and object forms into this shape so consumers always receive the
 * locale and its {@link PseudoLocaleOptions} separately.
 */
export type PseudoLocaleConfigNormalized = {
  locale: string
  options: PseudoLocaleOptions
}

type ModuleSourceNormalized = readonly [module: string, specifier: string]

export type LinguiConfigNormalized = Omit<
  LinguiConfig & typeof defaultConfig,
  "runtimeConfigModule" | "pseudoLocale"
> & {
  resolvedConfigPath?: string
  pseudoLocale: PseudoLocaleConfigNormalized
  runtimeConfigModule: {
    i18n: ModuleSourceNormalized
    useLingui: ModuleSourceNormalized
    Trans: ModuleSourceNormalized
  }
}
