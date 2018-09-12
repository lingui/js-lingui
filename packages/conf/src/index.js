const path = require("path")
const chalk = require("chalk")
const cosmiconfig = require("cosmiconfig")
const { validate } = require("jest-validate")
const { replacePathSepForRegex } = require("jest-regex-util")

const NODE_MODULES = "node_modules" + path.sep

const pipe = (...functions) => args =>
  functions.reduce((arg, fn) => fn(arg), args)

export function replaceRootDir(conf, rootDir, keys) {
  const replace = s => s.replace("<rootDir>", rootDir)
  ;(keys || Object.keys(conf)).forEach(originalKey => {
    const key = replace(originalKey)
    const value = conf[originalKey]

    if (!value) {
    } else if (typeof value === "string") {
      conf[key] = replace(value)
    } else if (typeof value === "object") {
      conf[key] = replaceRootDir(conf[originalKey], rootDir)
    } else if (value.length) {
      conf[key] = value.map(replace)
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
export function fallbackLanguageMigration(config) {
  const { fallbackLocale, fallbackLanguage, ...newConfig } = config

  newConfig.fallbackLocale = fallbackLocale || fallbackLanguage || ""
  return newConfig
}

/**
 * Replace localeDir, srcPathDirs and srcPathIgnorePatterns with catalogs
 *
 * Released in @lingui/conf 3.0
 * Remove anytime after 4.x
 */
export function catalogMigration(config) {
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

export const defaultConfig = {
  catalogs: {
    [path.join("<rootDir>", "locale", "{locale}", "messages")]:
      "<rootDir>" + path.sep
  },
  compileNamespace: "cjs",
  extractBabelOptions: { plugins: [], presets: [] },
  fallbackLocale: "",
  format: "po",
  locales: [],
  pseudoLocale: "",
  sourceLocale: ""
}

const exampleConfig = {
  ...defaultConfig,
  extractBabelOptions: {
    plugins: ["plugin"],
    presets: ["preset"]
  }
}

const deprecatedConfig = {
  fallbackLanguage: config =>
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
  localeDir: config =>
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
  srcPathDirs: config =>
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
  srcPathIgnorePatterns: config =>
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

export function getConfig({ cwd } = {}) {
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
