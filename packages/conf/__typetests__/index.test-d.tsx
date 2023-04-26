import {
  ExtractedMessage,
  ExtractorCtx,
  FallbackLocales,
  LinguiConfig,
} from "@lingui/conf"
import { expectAssignable } from "tsd-lite"

// only required props
expectAssignable<LinguiConfig>({
  locales: ["en", "pl"],
})

// all props
expectAssignable<LinguiConfig>({
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
  format: "po" as const,
  formatOptions: { origins: true, lineNumbers: true },
  locales: [],
  orderBy: "messageId" as const,
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"] as [string, string],
  sourceLocale: "",
  service: { name: "", apiKey: "" },
})

// custom extractors
expectAssignable<LinguiConfig>({
  locales: ["en", "pl"],
  extractors: [
    "babel",
    {
      match: (fileName: string) => false,
      extract: (
        filename: string,
        code: string,
        onMessageExtracted: (msg: ExtractedMessage) => void,
        ctx?: ExtractorCtx
      ) => {},
    },
  ],
})

// runtimeConfigModule
expectAssignable<LinguiConfig>({
  locales: ["en", "pl"],
  runtimeConfigModule: ["./custom-i18n-config", "i18n"] as [string, string],
})

expectAssignable<LinguiConfig>({
  locales: ["en", "pl"],
  runtimeConfigModule: {
    i18n: ["./custom-config", "i18n"] as [string, string],
    Trans: ["./custom-config", "Trans"] as [string, string],
  },
})
