import {
  ExtractedMessage,
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
import type { ExtractorOptions } from "@lingui/cli/src/api/extractors"

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
  extractorParserOptions: {
    flow: false,
    decoratorsBeforeExport: false,
  },
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
        extract: (
          filename: string,
          code: string,
          onMessageExtracted: (msg: ExtractedMessage) => void,
          options?: ExtractorOptions
        ) => {},
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
  extractorParserOptions: {
    flow: false,
    decoratorsBeforeExport: false,
  },
}

/**
 * Introduced in v4, remove in v5
 */
const extractBabelOptionsDeprecations = {
  extractBabelOptions: () =>
    ` Option ${chalk.bold("extractBabelOptions")} was removed. 
    
    Please remove it from your config file. 

    You can find more information here: https://lingui.dev/releases/migration-4.md
    `,
}

const configValidation = {
  exampleConfig,
  deprecatedConfig: {
    ...catalogMigrationDeprecations,
    ...fallbackLanguageMigrationDeprecations,
    ...extractBabelOptionsDeprecations,
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
