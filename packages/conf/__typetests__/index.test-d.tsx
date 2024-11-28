import {
  ExtractedMessage,
  ExtractorCtx,
  FallbackLocales,
  LinguiConfig,
} from "@lingui/conf"
import { expectAssignable } from "tsd"

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
  format: "po",
  formatOptions: { origins: true, lineNumbers: true },
  locales: [],
  orderBy: "messageId",
  pseudoLocale: "",
  rootDir: ".",
  runtimeConfigModule: ["@lingui/core", "i18n"],
  sourceLocale: "",
  service: { name: "", apiKey: "" },
})

// custom extractors
expectAssignable<LinguiConfig>({
  locales: ["en", "pl"],
  extractors: [
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
  runtimeConfigModule: ["./custom-i18n-config", "i18n"],
})

expectAssignable<LinguiConfig>({
  locales: ["en", "pl"],
  runtimeConfigModule: {
    i18n: ["./custom-config", "i18n"],
    Trans: ["./custom-config", "Trans"],
  },
})
