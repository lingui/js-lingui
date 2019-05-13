type Format = "po" | "lingui" | "minimal"

type Maybe<T> = T | null

export type LinguiConfig = {
  rootDir: string
  localeDir: string
  sourceLocale: string
  fallbackLocale: string
  pseudoLocale: string
  srcPathDirs: Array<string>
  srcPathIgnorePatterns: Array<string>
  format: Format
  prevFormat: Format
}

export type IdempotentResult<T> = [boolean, Maybe<T>] // [ created, result ]

export type MessageType = {
  translation: string
  defaults?: string
  origin: Array<[number, string]>
  description?: string
  comments?: Array<string>
  obsolete: boolean
  flags?: Array<string>
}

export type CatalogType = {
  [msgId: string]: MessageType
}

export type AllCatalogsType = {
  [locale: string]: CatalogType
}

export type getTranslationOptions = {
  fallbackLocale: string
  sourceLocale: string
}

export type TranslationsFormat = {
  filename: string
  read(filename: string): Maybe<CatalogType>
  write(filename: string, catalog: CatalogType): void
}

export type CatalogApi = {
  getLocales(): Array<string>
  addLocale(locale: string): IdempotentResult<string>

  read(locale: string): Maybe<CatalogType>
  readAll(): AllCatalogsType
  merge(
    prevCatalogs: AllCatalogsType,
    catalog: CatalogType,
    options?: { [key: string]: any }
  ): AllCatalogsType
  write(locale: string, catalog: CatalogType): IdempotentResult<string>
  writeCompiled(locale: string, content: string): string

  getTranslation(
    catalogs: AllCatalogsType,
    locale: string,
    msgId: string,
    options: getTranslationOptions
  ): Maybe<string>
}
