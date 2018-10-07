// @flow
const path = require("path")
const chalk = require("chalk")
const cosmiconfig = require("cosmiconfig")
// $FlowIgnore: Missing module definition
const { validate } = require("jest-validate")

const NODE_MODULES = "node_modules" + path.sep

export type CatalogFormat = "po" | "minimal" | "lingui"

type CatalogsConfig = { [destination: string]: string | Array<string> }

type InputConfig = {
  catalogs: CatalogsConfig,
  compileNamespace: string,
  extractBabelOptions: Object,
  fallbackLocale: string,
  format: CatalogFormat,
  locales: Array<string>,
  pseudoLocale: string,
  sourceLocale: string,
  rootDir?: string
}

export type LinguiConfig = InputConfig | { rootDir: string }

export const defaultConfig: InputConfig = {
  catalogs: {
    [path.join("<rootDir>", "locale", "{locale}", "messages")]: [
      `<rootDir>`,
      `!*/node_modules/*`
    ]
  },
  compileNamespace: "cjs",
  extractBabelOptions: { plugins: [], presets: [] },
  fallbackLocale: "",
  format: "po",
  locales: [],
  pseudoLocale: "",
  sourceLocale: ""
}

export function getConfig({ cwd }: { cwd: string } = {}): LinguiConfig {
  const defaultRootDir = cwd || process.cwd()
  const configExplorer = cosmiconfig("lingui")
  const result = configExplorer.searchSync(defaultRootDir)
  const userConfig = result ? result.config : {}
  const config = { ...defaultConfig, ...userConfig }

  validate(config, configValidation)

  if (!config.rootDir) {
    config.rootDir = result ? path.dirname(result.filepath) : defaultRootDir
  }

  return pipe(
    // List config migrations from oldest to newest
    fallbackLanguageMigration,
    catalogMigration,

    // `replaceRootDir` should always be the last
    config => replaceRootDir(config, config.rootDir, ["catalogs"])
  )(config)
}

const exampleConfig = {
  ...defaultConfig,
  extractBabelOptions: {
    plugins: ["plugin"],
    presets: ["preset"]
  }
}

const deprecatedConfig = {
  fallbackLanguage: (config: InputConfig & { fallbackLanguage: string }) =>
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
  localeDir: (config: InputConfig) =>
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
  srcPathDirs: (config: InputConfig) =>
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
  srcPathIgnorePatterns: (config: InputConfig) =>
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

/**
 *
 * @param conf
 * @param rootDir
 * @param keys
 * @return {*}
 */
export function replaceRootDir(
  conf: InputConfig,
  rootDir: string,
  keys: ?Array<string>
) {
  const replace = s => s.replace("<rootDir>", rootDir)
  ;(keys || Object.keys(conf)).forEach(originalKey => {
    const key = replace(originalKey)
    const value = conf[originalKey]

    if (!value) {
    } else if (typeof value === "string") {
      conf[key] = replace(value)
    } else if (Array.isArray(value)) {
      conf[key] = value.map(replace)
    } else if (typeof value === "object") {
      conf[key] = replaceRootDir(conf[key], rootDir)
    }

    if (key !== originalKey) delete conf[originalKey]
  })

  return conf
}

/**
 * Replace fallbackLanguage with fallbackLocale
 *
 * Released in lingui-conf 0.9
 * Remove anytime after 3.x
 */
export function fallbackLanguageMigration(config: Object) {
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
export function catalogMigration(config: Object) {
  const {
    // These values were default configuration.
    localeDir = "locale",
    srcPathDirs = ["<rootDir>"],
    srcPathIgnorePatterns = [NODE_MODULES],
    ...newConfig
  } = config

  if (typeof localeDir === "string") {
    let newLocaleDir = localeDir
    if (localeDir.slice(-1) !== path.sep) {
      newLocaleDir += "/"
    }

    newConfig.catalogs = {
      [path.join(newLocaleDir, "{locale}", "messages")]: [].concat(
        srcPathDirs,
        srcPathIgnorePatterns.map(pattern => `!${pattern}`)
      )
    }
  }

  return newConfig
}

const pipe = (...functions: Array<Function>) => (args: any): any =>
  functions.reduce((arg, fn) => fn(arg), args)
