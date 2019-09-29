import path from "path"
import fs from "fs"
import chalk from "chalk"
import cosmiconfig from "cosmiconfig"
import { validate } from "jest-validate"

export type CatalogFormat = "po" | "minimal" | "lingui"

type CatalogConfig = {
  name?: string
  path: string
  include: string[]
  exclude?: string[]
}

export type LinguiConfig = {
  catalogs: CatalogConfig[]
  compileNamespace: string
  extractBabelOptions: Object
  fallbackLocale: string
  format: CatalogFormat
  locales: Array<string>
  mergePath?: string
  pseudoLocale: string
  rootDir: string
  runtimeConfigModule: [string, string?]
  sourceLocale: string
}

export const defaultConfig: LinguiConfig = {
  catalogs: [
    {
      path: path.join("<rootDir>", "locale", "{locale}", "messages"),
      include: ["<rootDir>"],
      exclude: ["*/node_modules/*"]
    }
  ],
  compileNamespace: "cjs",
  extractBabelOptions: { plugins: [], presets: [] },
  fallbackLocale: "",
  format: "po",
  locales: [],
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  sourceLocale: ""
}

function configExists(path) {
  return path && fs.existsSync(path)
}

export function getConfig({
  cwd,
  configPath,
  skipValidation = false
}: {
  cwd?: string
  configPath?: string
  skipValidation?: boolean
} = {}): LinguiConfig {
  const defaultRootDir = cwd || process.cwd()
  const configExplorer = cosmiconfig("lingui")

  const result = configExists(configPath)
    ? configExplorer.loadSync(configPath)
    : configExplorer.searchSync(defaultRootDir)
  const userConfig = result ? result.config : {}
  const config: LinguiConfig = {
    ...defaultConfig,
    rootDir: result ? path.dirname(result.filepath) : defaultRootDir,
    ...userConfig
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
      config => replaceRootDir(config, config.rootDir)
    )(config)
  } else {
    return replaceRootDir(config, config.rootDir)
  }
}

const exampleConfig = {
  ...defaultConfig,
  extractBabelOptions: {
    extends: "babelconfig.js",
    rootMode: "rootmode",
    plugins: ["plugin"],
    presets: ["preset"]
  }
}

const deprecatedConfig = {
  fallbackLanguage: (config: LinguiConfig & DeprecatedFallbackLanguage) =>
    ` Option ${chalk.bold("fallbackLanguage")} was replaced by ${chalk.bold(
      "fallbackLocale"
    )}
    
    @lingui/cli now treats your current configuration as:
    {
      ${chalk.bold('"fallbackLocale"')}: ${chalk.bold(
      `"${config.fallbackLanguage}"`
    )}
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
    `
}

export const configValidation = {
  exampleConfig,
  deprecatedConfig,
  comment: "Documentation: https://lingui.js.org/ref/conf.html"
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
    const replace = s => s.replace("<rootDir>", rootDir)

    if (value == null) {
      return value
    } else if (typeof value === "string") {
      return replace(value)
    } else if (Array.isArray(value)) {
      return value.map(item => replaceDeep(item, rootDir)) as any
    } else if (typeof value === "object") {
      Object.keys(value).forEach(key => {
        const newKey = replaceDeep(key, rootDir)
        value[newKey] = replaceDeep(value[key], rootDir)
        if (key !== newKey) delete value[key]
      })
    }

    return value
  })(config, rootDir)
}

/**
 * Replace fallbackLanguage with fallbackLocale
 *
 * Released in lingui-conf 0.9
 * Remove anytime after 3.x
 */
type DeprecatedFallbackLanguage = { fallbackLanguage: string | null }

export function fallbackLanguageMigration(
  config: LinguiConfig & DeprecatedFallbackLanguage
): LinguiConfig {
  const { fallbackLocale, fallbackLanguage, ...newConfig } = config

  return {
    ...newConfig,
    fallbackLocale: fallbackLocale || fallbackLanguage || ""
  }
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
      localeDir = path.join("<rootDir>", "locale", "{locale}", "messages")
    if (srcPathDirs === undefined) srcPathDirs = ["<rootDir>"]
    if (srcPathIgnorePatterns === undefined)
      srcPathIgnorePatterns = ["*/node_modules/*"]

    let newLocaleDir = localeDir
    if (localeDir.slice(-1) !== path.sep) {
      newLocaleDir += "/"
    }

    if (!Array.isArray(newConfig.catalogs)) {
      newConfig.catalogs = []
    }

    newConfig.catalogs.push({
      path: path.join(newLocaleDir, "{locale}", "messages"),
      include: srcPathDirs,
      exclude: srcPathIgnorePatterns
    })
  }

  return newConfig
}

const pipe = (...functions: Array<Function>) => (args: any): any =>
  functions.reduce((arg, fn) => fn(arg), args)
