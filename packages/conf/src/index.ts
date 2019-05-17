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
  format: "po",
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

function configFilePathFromArgs() {
  const configIndex = process.argv.indexOf("--config")

  if (
    configIndex >= 0 &&
    process.argv.length > configIndex &&
    fs.existsSync(process.argv[configIndex + 1])
  ) {
    return process.argv[configIndex + 1]
  }

  return null
}

export function getConfig({ cwd } = { cwd: null }) {
  const configExplorer = cosmiconfig("lingui")
  const defaultRootDir = cwd || process.cwd()
  const configPath = configFilePathFromArgs()

  const result =
    configPath == null
      ? configExplorer.searchSync(defaultRootDir)
      : configExplorer.loadSync(configPath)

  const config = { ...defaultConfig, ...(result ? result.config : {}) }

  validate(config, configValidation)
  // Use deprecated fallbackLanguage, if defined
  config.fallbackLocale = config.fallbackLocale || config.fallbackLanguage || ""

  const rootDir = result ? path.dirname(result.filepath) : defaultRootDir
  return replaceRootDir(config, rootDir)
}
