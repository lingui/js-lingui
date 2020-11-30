import path from "path"
import fs from "fs"
import chalk from "chalk"
import { cosmiconfigSync } from "cosmiconfig"
import { multipleValidOptions, validate } from "jest-validate"

export type CatalogFormat = "lingui" | "minimal" | "po" | "csv"

export type CatalogFormatOptions = {
  origins?: boolean
}

export type OrderBy = "messageId" | "origin"

type CatalogConfig = {
  name?: string
  path: string
  include: string[]
  exclude?: string[]
}

type LocaleObject = {
  [locale: string]: string[] | string
}
type DefaultLocaleObject = {
  default: string
}
export type FallbackLocales = LocaleObject | DefaultLocaleObject | false

type ModuleSource = [string, string?];

export type LinguiConfig = {
  catalogs: CatalogConfig[]
  compileNamespace: string
  extractBabelOptions: Object
  fallbackLocales?: FallbackLocales
  format: CatalogFormat
  formatOptions: CatalogFormatOptions
  locales: string[]
  catalogsMergePath?: string
  orderBy: OrderBy
  pseudoLocale: string
  rootDir: string
  runtimeConfigModule: ModuleSource | {[symbolName: string]: ModuleSource},
  sourceLocale: string
}

// Enforce posix path delimiters internally
const pathJoinPosix = (...values) =>
  path
    // normalize double slashes
    .join(...values)
    // convert platform specific path.sep to posix
    .split(path.sep)
    .join("/")

export const defaultConfig: LinguiConfig = {
  catalogs: [
    {
      path: pathJoinPosix("<rootDir>", "locale", "{locale}", "messages"),
      include: ["<rootDir>"],
      exclude: ["*/node_modules/*"],
    },
  ],
  compileNamespace: "cjs",
  extractBabelOptions: { plugins: [], presets: [] },
  fallbackLocales: {},
  format: "po",
  formatOptions: { origins: true },
  locales: [],
  orderBy: "messageId",
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  sourceLocale: "",
}

function configExists(path) {
  return path && fs.existsSync(path)
}

export function getConfig({
  cwd,
  configPath,
  skipValidation = false,
}: {
  cwd?: string
  configPath?: string
  skipValidation?: boolean
} = {}): LinguiConfig {
  const defaultRootDir = cwd || process.cwd()
  const configExplorer = cosmiconfigSync("lingui")

  const result = configExists(configPath)
    ? configExplorer.load(configPath)
    : configExplorer.search(defaultRootDir)
  const userConfig = result ? result.config : {}
  const config: LinguiConfig = {
    ...defaultConfig,
    rootDir: result ? path.dirname(result.filepath) : defaultRootDir,
    ...userConfig,
  }

  if (!skipValidation) {
    validate(config, configValidation)

    return pipe(
      // List config migrations from oldest to newest
      fallbackLanguageMigration,
      catalogMigration,

      // Custom validation
      validateLocales,

      // `replaceRootDir` should always be the last
      (config) => replaceRootDir(config, config.rootDir)
    )(config)
  } else {
    return replaceRootDir(config, config.rootDir)
  }
}

const exampleConfig = {
  ...defaultConfig,
  fallbackLocales: multipleValidOptions(
    {},
    { "en-US": "en" },
    { "en-US": ["en"] },
    { default: "en" },
    false
  ),
  extractBabelOptions: {
    extends: "babelconfig.js",
    rootMode: "rootmode",
    plugins: ["plugin"],
    presets: ["preset"],
  },
}

const deprecatedConfig = {
    fallbackLocale: (config: LinguiConfig & DeprecatedFallbackLanguage) =>
    ` Option ${chalk.bold("fallbackLocale")} was replaced by ${chalk.bold(
      "fallbackLocales"
    )}

    You can find more information here: https://github.com/lingui/js-lingui/issues/791

    @lingui/cli now treats your current configuration as:
    {
      ${chalk.bold('"fallbackLocales"')}: {
        default: ${chalk.bold(
          `"${config.fallbackLocale}"`
        )}
      }
    }

    Please update your configuration.
    `,
  localeDir: (config: LinguiConfig & DeprecatedLocaleDir) =>
    ` Option ${chalk.bold(
      "localeDir"
    )} is deprecated. Configure source paths using ${chalk.bold(
      "catalogs"
    )} instead.

    @lingui/cli now treats your current configuration as:

    {
      ${chalk.bold('"catalogs"')}: ${JSON.stringify(
      catalogMigration(config).catalogs,
      null,
      2
    )}
    }

    Please update your configuration.
    `,
  srcPathDirs: (config: LinguiConfig & DeprecatedLocaleDir) =>
    ` Option ${chalk.bold(
      "srcPathDirs"
    )} is deprecated. Configure source paths using ${chalk.bold(
      "catalogs"
    )} instead.

    @lingui/cli now treats your current configuration as:

    {
      ${chalk.bold('"catalogs"')}: ${JSON.stringify(
      catalogMigration(config).catalogs,
      null,
      2
    )}
    }

    Please update your configuration.
    `,
  srcPathIgnorePatterns: (config: LinguiConfig & DeprecatedLocaleDir) =>
    ` Option ${chalk.bold(
      "srcPathIgnorePatterns"
    )} is deprecated. Configure excluded source paths using ${chalk.bold(
      "catalogs"
    )} instead.

    @lingui/cli now treats your current configuration as:

    {
      ${chalk.bold('"catalogs"')}: ${JSON.stringify(
      catalogMigration(config).catalogs,
      null,
      2
    )}
    }

    Please update your configuration.
    `,
}

export const configValidation = {
  exampleConfig,
  deprecatedConfig,
  comment: "Documentation: https://lingui.js.org/ref/conf.html",
}

function validateLocales(config) {
  if (!Array.isArray(config.locales) || !config.locales.length) {
    console.error("No locales defined!\n")
    console.error(
      `Add ${chalk.yellow(
        "'locales'"
      )} to your configuration. See ${chalk.underline(
        "https://lingui.js.org/ref/conf.html#locales"
      )}`
    )
  }

  return config
}

export function replaceRootDir(
  config: LinguiConfig,
  rootDir: string
): LinguiConfig {
  return (function replaceDeep<T>(value: T, rootDir: string): T {
    const replace = (s) => s.replace("<rootDir>", rootDir)

    if (value == null) {
      return value
    } else if (typeof value === "string") {
      return replace(value)
    } else if (Array.isArray(value)) {
      return value.map((item) => replaceDeep(item, rootDir)) as any
    } else if (typeof value === "object") {
      Object.keys(value).forEach((key) => {
        const newKey = replaceDeep(key, rootDir)
        value[newKey] = replaceDeep(value[key], rootDir)
        if (key !== newKey) delete value[key]
      })
    }

    return value
  })(config, rootDir)
}

/**
 * Replace fallbackLocale, by the new standard fallbackLocales
 * - https://github.com/lingui/js-lingui/issues/791
 * - Remove anytime after 4.x
 */
type DeprecatedFallbackLanguage = { fallbackLocale?: string }

export function fallbackLanguageMigration(
  config: LinguiConfig & DeprecatedFallbackLanguage
): LinguiConfig {
  const { fallbackLocale, fallbackLocales } = config

  if (fallbackLocales === false) return {
    ...config,
    fallbackLocales: null,
  }

  config.locales.forEach((locale) => {
    const fl = getCldrParentLocale(locale.toLowerCase())
    if (fl && !config.fallbackLocales[locale]) {
      config.fallbackLocales = {
        ...config.fallbackLocales,
        [locale]: fl
      }
    }
  })

  const DEFAULT_FALLBACK = fallbackLocales?.default || fallbackLocale
  if (DEFAULT_FALLBACK) {
    if (!config.fallbackLocales) config.fallbackLocales = {}
    config.fallbackLocales.default = DEFAULT_FALLBACK
  }

  return config
}

function getCldrParentLocale(sourceLocale: string) {
  return {
    "en-ag": "en",
    "en-ai": "en",
    "en-au": "en",
    "en-bb": "en",
    "en-bm": "en",
    "en-bs": "en",
    "en-bw": "en",
    "en-bz": "en",
    "en-ca": "en",
    "en-cc": "en",
    "en-ck": "en",
    "en-cm": "en",
    "en-cx": "en",
    "en-cy": "en",
    "en-dg": "en",
    "en-dm": "en",
    "en-er": "en",
    "en-fj": "en",
    "en-fk": "en",
    "en-fm": "en",
    "en-gb": "en",
    "en-gd": "en",
    "en-gg": "en",
    "en-gh": "en",
    "en-gi": "en",
    "en-gm": "en",
    "en-gy": "en",
    "en-hk": "en",
    "en-ie": "en",
    "en-il": "en",
    "en-im": "en",
    "en-in": "en",
    "en-io": "en",
    "en-je": "en",
    "en-jm": "en",
    "en-ke": "en",
    "en-ki": "en",
    "en-kn": "en",
    "en-ky": "en",
    "en-lc": "en",
    "en-lr": "en",
    "en-ls": "en",
    "en-mg": "en",
    "en-mo": "en",
    "en-ms": "en",
    "en-mt": "en",
    "en-mu": "en",
    "en-mw": "en",
    "en-my": "en",
    "en-na": "en",
    "en-nf": "en",
    "en-ng": "en",
    "en-nr": "en",
    "en-nu": "en",
    "en-nz": "en",
    "en-pg": "en",
    "en-ph": "en",
    "en-pk": "en",
    "en-pn": "en",
    "en-pw": "en",
    "en-rw": "en",
    "en-sb": "en",
    "en-sc": "en",
    "en-sd": "en",
    "en-sg": "en",
    "en-sh": "en",
    "en-sl": "en",
    "en-ss": "en",
    "en-sx": "en",
    "en-sz": "en",
    "en-tc": "en",
    "en-tk": "en",
    "en-to": "en",
    "en-tt": "en",
    "en-tv": "en",
    "en-tz": "en",
    "en-ug": "en",
    "en-us": "en",
    "en-vc": "en",
    "en-vg": "en",
    "en-vu": "en",
    "en-ws": "en",
    "en-za": "en",
    "en-zm": "en",
    "en-zw": "en",
    "en-at": "en",
    "en-be": "en",
    "en-ch": "en",
    "en-de": "en",
    "en-dk": "en",
    "en-fi": "en",
    "en-nl": "en",
    "en-se": "en",
    "en-si": "en",
    "es-ar": "es",
    "es-bo": "es",
    "es-br": "es",
    "es-bz": "es",
    "es-cl": "es",
    "es-co": "es",
    "es-cr": "es",
    "es-cu": "es",
    "es-do": "es",
    "es-ec": "es",
    "es-es": "es",
    "es-gt": "es",
    "es-hn": "es",
    "es-mx": "es",
    "es-ni": "es",
    "es-pa": "es",
    "es-pe": "es",
    "es-pr": "es",
    "es-py": "es",
    "es-sv": "es",
    "es-us": "es",
    "es-uy": "es",
    "es-ve": "es",
    "pt-ao": "pt",
    "pt-ch": "pt",
    "pt-cv": "pt",
    "pt-fr": "pt",
    "pt-gq": "pt",
    "pt-gw": "pt",
    "pt-lu": "pt",
    "pt-mo": "pt",
    "pt-mz": "pt",
    "pt-pt": "pt",
    "pt-st": "pt",
    "pt-tl": "pt",
    "az-arab": "az",
    "az-cyrl": "az",
    "blt-latn": "blt",
    "bm-nkoo": "bm",
    "bs-cyrl": "bs",
    "byn-latn": "byn",
    "cu-glag": "cu",
    "dje-arab": "dje",
    "dyo-arab": "dyo",
    "en-dsrt": "en",
    "en-shaw": "en",
    "ff-adlm": "ff",
    "ff-arab": "ff",
    "ha-arab": "ha",
    "hi-latn": "hi",
    "iu-latn": "iu",
    "kk-arab": "kk",
    "ks-deva": "ks",
    "ku-arab": "ku",
    "ky-arab": "ky",
    "ky-latn": "ky",
    "ml-arab": "ml",
    "mn-mong": "mn",
    "mni-mtei": "mni",
    "ms-arab": "ms",
    "pa-arab": "pa",
    "sat-deva": "sat",
    "sd-deva": "sd",
    "sd-khoj": "sd",
    "sd-sind": "sd",
    "shi-latn": "shi",
    "so-arab": "so",
    "sr-latn": "sr",
    "sw-arab": "sw",
    "tg-arab": "tg",
    "ug-cyrl": "ug",
    "uz-arab": "uz",
    "uz-cyrl": "uz",
    "vai-latn": "vai",
    "wo-arab": "wo",
    "yo-arab": "yo",
    "yue-hans": "yue",
    "zh-hant": "zh",
    "zh-hant-hk": "zh",
    "zh-hant-mo": "zh-hant-hk"
  }[sourceLocale]
}

/**
 * Replace localeDir, srcPathDirs and srcPathIgnorePatterns with catalogs
 *
 * Released in @lingui/conf 3.0
 * Remove anytime after 4.x
 */
type DeprecatedLocaleDir = {
  localeDir: string
  srcPathDirs: string[]
  srcPathIgnorePatterns: string[]
}

export function catalogMigration(
  config: LinguiConfig & DeprecatedLocaleDir
): LinguiConfig {
  let { localeDir, srcPathDirs, srcPathIgnorePatterns, ...newConfig } = config

  if (localeDir || srcPathDirs || srcPathIgnorePatterns) {
    // Replace missing values with default ones
    if (localeDir === undefined)
      localeDir = pathJoinPosix("<rootDir>", "locale", "{locale}", "messages")
    if (srcPathDirs === undefined) srcPathDirs = ["<rootDir>"]
    if (srcPathIgnorePatterns === undefined)
      srcPathIgnorePatterns = ["**/node_modules/**"]

    let newLocaleDir = localeDir.split(path.sep).join("/")
    if (newLocaleDir.slice(-1) !== path.sep) {
      newLocaleDir += "/"
    }

    if (!Array.isArray(newConfig.catalogs)) {
      newConfig.catalogs = []
    }

    newConfig.catalogs.push({
      path: pathJoinPosix(newLocaleDir, "{locale}", "messages"),
      include: srcPathDirs,
      exclude: srcPathIgnorePatterns,
    })
  }

  return newConfig
}

const pipe = (...functions: Array<Function>) => (args: any): any =>
  functions.reduce((arg, fn) => fn(arg), args)
