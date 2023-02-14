import { GeneratorOptions } from "@babel/core"
import { ExtractOptions } from "@lingui/cli/src/api/extractors"

export type CatalogFormat = "lingui" | "minimal" | "po" | "csv" | "po-gettext"

export type ExtractedMessage = {
  id: string

  message?: string
  context?: string
  origin?: [filename: string, line: number]

  comment?: string
}

export type ExtractorType = {
  match(filename: string): boolean
  extract(
    filename: string,
    onMessageExtracted: (msg: ExtractedMessage) => void,
    options?: ExtractOptions
  ): Promise<void> | void
}

export type CatalogFormatOptions = {
  origins?: boolean
  lineNumbers?: boolean
  disableSelectWarning?: boolean
}

export type OrderBy = "messageId" | "origin"

export type CatalogConfig = {
  name?: string
  path: string
  include: string[]
  exclude?: string[]
}

type LocaleObject = {
  [locale: string]: string[] | string
  default: string
}

export type FallbackLocales = LocaleObject

type ModuleSource = [string, string?]

type CatalogService = {
  name: string
  apiKey: string
}

export type LinguiConfig = {
  catalogs: CatalogConfig[]
  compileNamespace: "es" | "ts" | "cjs" | string
  extractBabelOptions: Record<string, unknown>
  compilerBabelOptions: GeneratorOptions
  fallbackLocales?: FallbackLocales | false
  extractors?: ExtractorType[] | string[]
  prevFormat?: CatalogFormat
  localeDir?: string
  format: CatalogFormat
  formatOptions: CatalogFormatOptions
  locales: string[]
  catalogsMergePath: string
  orderBy: OrderBy
  pseudoLocale: string
  rootDir: string
  runtimeConfigModule: ModuleSource | { [symbolName: string]: ModuleSource }
  sourceLocale: string
  service: CatalogService
}

export type LinguiConfigNormalized = LinguiConfig & {
  fallbackLocales?: FallbackLocales
}
