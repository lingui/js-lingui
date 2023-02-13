import {
  ExtractorType,
  FallbackLocales,
  LinguiConfig,
  LinguiConfigNormalized,
} from "./types"
import {
  fallbackLanguageMigration,
  fallbackLanguageMigrationDeprecations,
} from "./migrations/fallbackLanguageMigration"
import {
  catalogMigration,
  catalogMigrationDeprecations,
} from "./migrations/catalogMigration"
import chalk from "chalk"
import { replaceRootDir } from "./utils/replaceRootDir"
import { multipleValidOptions, validate } from "jest-validate"
import { setCldrParentLocales } from "./migrations/setCldrParentLocales"
import { pathJoinPosix } from "./utils/pathJoinPosix"

export function makeConfig(
  userConfig: Partial<LinguiConfig>,
  opts: {
    skipValidation?: boolean
  } = {}
): LinguiConfigNormalized {
  let config: LinguiConfig = {
    ...defaultConfig,
    ...userConfig,
  }

  if (!opts.skipValidation) {
    validate(config, configValidation)

    config = pipe(
      // List config migrations from oldest to newest
      fallbackLanguageMigration,
      setCldrParentLocales,
      catalogMigration,

      // Custom validation
      validateLocales
    )(config)
  }

  // `replaceRootDir` should always be the last
  return replaceRootDir(config, config.rootDir) as LinguiConfigNormalized
}

export const defaultConfig: LinguiConfig = {
  catalogs: [
    {
      path: pathJoinPosix("<rootDir>", "locale", "{locale}", "messages"),
      include: ["<rootDir>"],
      exclude: ["*/node_modules/*"],
    },
  ],
  catalogsMergePath: "",
  compileNamespace: "cjs",
  compilerBabelOptions: {
    minified: true,
    jsescOption: {
      minimal: true,
    },
  },
  extractBabelOptions: { plugins: [], presets: [] },
  fallbackLocales: {} as FallbackLocales,
  format: "po",
  formatOptions: { origins: true, lineNumbers: true },
  locales: [],
  orderBy: "messageId",
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  sourceLocale: "",
  service: { name: "", apiKey: "" },
}
export const exampleConfig = {
  ...defaultConfig,
  extractors: multipleValidOptions(
    [],
    ["babel"],
    [
      {
        match: (fileName: string) => false,
        extract: (filename: string, onMessageExtracted, options?: any) => {},
      } as ExtractorType,
    ]
  ),
  runtimeConfigModule: multipleValidOptions(
    { i18n: ["@lingui/core", "i18n"], Trans: ["@lingui/react", "Trans"] },
    ["@lingui/core", "i18n"]
  ),
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
    targets: multipleValidOptions(
      {},
      "> 0.5%",
      ["> 0.5%", "not dead"],
      undefined
    ),
    assumptions: multipleValidOptions({}, undefined),
    browserslistConfigFile: multipleValidOptions(true, undefined),
    browserslistEnv: multipleValidOptions(".browserslistrc", undefined),
  },
}

const configValidation = {
  exampleConfig,
  deprecatedConfig: {
    ...catalogMigrationDeprecations,
    ...fallbackLanguageMigrationDeprecations,
  },
  comment: "Documentation: https://lingui.dev/ref/conf",
}

function validateLocales(config: LinguiConfig) {
  if (!Array.isArray(config.locales) || !config.locales.length) {
    console.error("No locales defined!\n")
    console.error(
      `Add ${chalk.yellow(
        "'locales'"
      )} to your configuration. See ${chalk.underline(
        "https://lingui.dev/ref/conf#locales"
      )}`
    )
  }

  return config
}

const pipe =
  (...functions: Array<Function>) =>
  (args: any): any =>
    functions.reduce((arg, fn) => fn(arg), args)
