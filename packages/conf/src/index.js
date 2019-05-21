const path = require("path")
const fs = require("fs")
const chalk = require("chalk")
const cosmiconfig = require("cosmiconfig")
const { validate } = require("jest-validate")
const { replacePathSepForRegex } = require("jest-regex-util")

const NODE_MODULES = replacePathSepForRegex(
  path.sep + "node_modules" + path.sep
)

export function replaceRootDir(conf, rootDir) {
  const replace = s => s.replace("<rootDir>", rootDir)
  ;["srcPathDirs", "srcPathIgnorePatterns", "localeDir"].forEach(key => {
    const value = conf[key]

    if (!value) {
    } else if (typeof value === "string") {
      conf[key] = replace(value)
    } else if (value.length) {
      conf[key] = value.map(replace)
    }
  })

  conf.rootDir = rootDir
  return conf
}

export const defaultConfig = {
  localeDir: "./locale",
  sourceLocale: "",
  fallbackLocale: "",
  pseudoLocale: "",
  srcPathDirs: ["<rootDir>"],
  srcPathIgnorePatterns: [NODE_MODULES],
  format: "lingui",
  rootDir: ".",
  extractBabelOptions: {
    plugins: [],
    presets: []
  },
  compileNamespace: "cjs"
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
    `
}

const configValidation = {
  exampleConfig,
  deprecatedConfig,
  comment: "See https://lingui.js.org/ref/conf.html for a list of valid options"
}

function configExists(path) {
  return path && fs.existsSync(path)
}

export function getConfig({ cwd, configPath } = {}) {
  const configExplorer = cosmiconfig("lingui")
  const defaultRootDir = cwd || process.cwd()

  const result = configExists(configPath)
    ? configExplorer.loadSync(configPath)
    : configExplorer.searchSync(defaultRootDir)

  const raw = { ...defaultConfig, ...(result ? result.config : {}) }

  validate(raw, configValidation)
  // Use deprecated fallbackLanguage, if defined
  raw.fallbackLocale = raw.fallbackLocale || raw.fallbackLanguage || ""

  const rootDir = result ? path.dirname(result.filepath) : defaultRootDir
  return replaceRootDir(raw, rootDir)
}
