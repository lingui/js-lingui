import type {
  FallbackLocales,
  LinguiConfig,
  LinguiConfigNormalized,
} from "./types"
import { styleText } from "node:util"
import { replaceRootDir } from "./utils/replaceRootDir"
import { multipleValidOptions, validate } from "jest-validate"
import { setCldrParentLocales } from "./migrations/setCldrParentLocales"
import { pathJoinPosix } from "./utils/pathJoinPosix"
import { normalizeRuntimeConfigModule } from "./migrations/normalizeRuntimeConfigModule"
import {
  ExperimentalExtractorOptions,
  PseudoLocaleConfig,
  PseudoLocaleConfigNormalized,
} from "./types"

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
    deprecateParserOptions(config)
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
    pseudoLocale: normalizePseudoLocale(config.pseudoLocale),
    resolvedConfigPath: opts.resolvedConfigPath,
  }
}

/**
 * Expands the `pseudoLocale` config (a plain string or a {@link PseudoLocaleConfig}
 * object) into a normalized shape with the locale and its options separated.
 */
function normalizePseudoLocale(
  pseudoLocale: LinguiConfig["pseudoLocale"],
): PseudoLocaleConfigNormalized {
  if (!pseudoLocale || typeof pseudoLocale === "string") {
    return { locale: pseudoLocale ?? "", options: {} }
  }
  const { locale, ...options } = pseudoLocale
  return { locale, options }
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
  fallbackLocales: {} as FallbackLocales,
  locales: [],
  orderBy: "message",
  pseudoLocale: "" as string | PseudoLocaleConfig,
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  macro: {
    corePackage: ["@lingui/core/macro"],
    jsxPackage: ["@lingui/react/macro"],
  },
  sourceLocale: "",
} satisfies LinguiConfig

export const exampleConfig = {
  ...defaultConfig,
  macro: {
    ...defaultConfig.macro,
    idPrefixLeader: ".",
    jsxPlaceholderAttribute: "_t",
    jsxPlaceholderDefaults: multipleValidOptions(
      {},
      { a: "link", em: "em", strong: "b" },
    ),
    jsxRuntime: multipleValidOptions("react", "solid"),
  },
  format: multipleValidOptions({}, {}),
  pseudoLocale: multipleValidOptions("", {
    locale: "",
    prepend: "",
    append: "",
    extend: 0,
    override: "",
  }),
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
      bundler: multipleValidOptions({}, undefined),
      resolveEsbuildOptions: Function,
    },
  } as { extractor: ExperimentalExtractorOptions },
}

const configValidation = {
  exampleConfig,
  comment: "Documentation: https://lingui.dev/ref/conf",
}

function deprecateParserOptions(config: LinguiConfig) {
  if (config.extractorParserOptions) {
    console.error(
      `\`extractorParserOptions\` config option is deprecated.
      
Please pass options directly to the extractor implementation:
      
import { createBabelExtractor } from '@lingui/cli/api/extractors/babel'

export default {
  [...]
  extractors: [createBabelExtractor({parserOptions: { tsExperimentalDecorators: true }})],
}
`.trim(),
    )
  }
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
      `Add ${styleText(
        "yellow",
        "'locales'",
      )} to your configuration. See ${styleText(
        "underline",
        "https://lingui.dev/ref/conf#locales",
      )}`,
    )
  }
}
