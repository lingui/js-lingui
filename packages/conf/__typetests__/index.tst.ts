import {
  CatalogType,
  ExtractedMessage,
  ExtractorCtx,
  FallbackLocales,
  LinguiConfig,
  ExtractorType,
} from "@lingui/conf"
import { expect } from "tstyche"

// only required props
expect({
  locales: ["en", "pl"],
}).type.toBeAssignableTo<LinguiConfig>()

// pseudoLocale as a string
expect({
  locales: ["en", "pseudo"],
  pseudoLocale: "pseudo",
}).type.toBeAssignableTo<LinguiConfig>()

// pseudoLocale as an object with pseudolocale options
expect({
  locales: ["en", "pseudo"],
  pseudoLocale: { locale: "pseudo", prepend: "⟦ ", append: " ⟧", extend: 0.4 },
}).type.toBeAssignableTo<LinguiConfig>()

// all props
expect({
  catalogs: [
    {
      path: "<rootDir>/locale/{locale}/messages",
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
  orderBy: "messageId" as const,
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"] as [string, string],
  sourceLocale: "",
  service: { name: "", apiKey: "" },
}).type.toBeAssignableTo<LinguiConfig>()

// custom extractors
expect({
  locales: ["en", "pl"],
  extractors: [
    {
      match: (fileName: string) => false,
      extract: (
        filename: string,
        code: string,
        onMessageExtracted: (msg: ExtractedMessage) => void,
        ctx?: ExtractorCtx,
      ) => {},
    },
  ],
}).type.toBeAssignableTo<LinguiConfig>()

// custom formatter
expect({
  locales: ["en", "pl"],
  format: {
    catalogExtension: "po",
    templateExtension: "pot",
    parse(content: string): Promise<CatalogType> {
      return Promise.resolve({} as CatalogType)
    },
    serialize(catalog: CatalogType): Promise<string> {
      return Promise.resolve("")
    },
  },
}).type.toBeAssignableTo<LinguiConfig>()

// runtimeConfigModule
expect({
  locales: ["en", "pl"],
  runtimeConfigModule: ["./custom-i18n-config", "i18n"] as [string, string],
}).type.toBeAssignableTo<LinguiConfig>()

expect({
  locales: ["en", "pl"],
  runtimeConfigModule: {
    i18n: ["./custom-config", "i18n"] as [string, string],
    Trans: ["./custom-config", "Trans"] as [string, string],
  },
}).type.toBeAssignableTo<LinguiConfig>()

const extractor: ExtractorType = {
  match: (fileName: string) => false,
  extract: (
    filename: string,
    code: string,
    onMessageExtracted: (msg: ExtractedMessage) => void,
    ctx?: ExtractorCtx,
  ) => {},
}
