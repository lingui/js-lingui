import type {
  FallbackLocales,
  LinguiConfig,
  LinguiConfigNormalized,
} from "./types"
import pico from "picocolors"
import { replaceRootDir } from "./utils/replaceRootDir"
import { multipleValidOptions, validate } from "jest-validate"
import { setCldrParentLocales } from "./migrations/setCldrParentLocales"
import { pathJoinPosix } from "./utils/pathJoinPosix"
import { normalizeRuntimeConfigModule } from "./migrations/normalizeRuntimeConfigModule"
import { ExperimentalExtractorOptions } from "./types"

export function makeConfig(
  userConfig: Partial<LinguiConfig>,
  opts: {
    skipValidation?: boolean
    resolvedConfigPath?: string
  } = {},
): LinguiConfigNormalized {
  let config: LinguiConfig = {
    ...defaultConfig,
    ...userConfig,
    macro: {
      ...defaultConfig.macro,
      ...userConfig.macro,
    },
  }

  if (!opts.skipValidation) {
    validateFormat(config)
    validate(config, configValidation)
    validateLocales(config)
  }

  // List config migrations from oldest to newest
  config = setCldrParentLocales(config)
  config = normalizeRuntimeConfigModule(config) as any

  // `replaceRootDir` should always be the last
  const out = replaceRootDir(
    config,
    config.rootDir,
  ) as unknown as LinguiConfigNormalized

  return {
    ...out,
    resolvedConfigPath: opts.resolvedConfigPath,
  }
}

export const defaultConfig = {
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
    tsExperimentalDecorators: false,
  },
  fallbackLocales: {} as FallbackLocales,
  locales: [],
  orderBy: "message",
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  macro: {
    corePackage: ["@lingui/macro", "@lingui/core/macro"],
    jsxPackage: ["@lingui/macro", "@lingui/react/macro"],
  },
  sourceLocale: "",
} satisfies LinguiConfig

export const exampleConfig = {
  ...defaultConfig,
  format: multipleValidOptions({}, {}),
  extractors: multipleValidOptions([], ["babel"], [Object]),
  runtimeConfigModule: multipleValidOptions(
    { i18n: ["@lingui/core", "i18n"], Trans: ["@lingui/react", "Trans"] },
    ["@lingui/core", "i18n"],
  ),
  fallbackLocales: multipleValidOptions(
    {},
    { "en-US": "en" },
    { "en-US": ["en"] },
    { default: "en" },
    false,
  ),
  extractorParserOptions: {
    flow: false,
    tsExperimentalDecorators: false,
  },
  service: {
    apiKey: "",
    name: "",
  },
  experimental: {
    extractor: {
      entries: [],
      includeDeps: [],
      excludeDeps: [],
      excludeExtensions: [],
      output: "",
      resolveEsbuildOptions: Function,
    },
  } as { extractor: ExperimentalExtractorOptions },
}

const configValidation = {
  exampleConfig,
  comment: "Documentation: https://lingui.dev/ref/conf",
}

function validateFormat(config: LinguiConfig) {
  if (typeof config.format === "string") {
    throw new Error(
      `String formats like \`{format: ${config.format}}\` are no longer supported.
      
Formatters must now be installed as separate packages and provided via format in lingui config:
        
import { formatter } from "@lingui/format-po"

export default {
  [...]
  format: formatter({lineNumbers: false}),
}
`.trim(),
    )
  }
}

function validateLocales(config: LinguiConfig) {
  if (!Array.isArray(config.locales) || !config.locales.length) {
    console.error("No locales defined!\n")
    console.error(
      `Add ${pico.yellow(
        "'locales'",
      )} to your configuration. See ${pico.underline(
        "https://lingui.dev/ref/conf#locales",
      )}`,
    )
  }
}
