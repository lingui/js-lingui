// @flow

export type LinguiConfig = {|
  rootDir: string,
  localeDir: string,
  sourceLocale: string,
  fallbackLocale: string,
  srcPathDirs: Array<string>,
  srcPathIgnorePatterns: Array<string>,
  format: "lingui" | "minimal" | "po"
|}

export type IdempotentResult<T> = [boolean, ?T] // [ created, result ]

export type MessageType = {
  translation: string,
  defaults: ?string,
  origin: Array<[number, string]>
}

export type CatalogType = {
  [msgId: string]: MessageType
}

export type AllCatalogsType = {
  [locale: string]: CatalogType
}

export type getTranslationOptions = {|
  fallbackLocale: string,
  sourceLocale: string
|}

export type TranslationsFormat = {
  filename: string,
  read(filename: string): ?CatalogType,
  write(filename: string, catalog: CatalogType): void
}

export type CatalogApi = {
  getLocales(): Array<string>,
  addLocale(locale: string): IdempotentResult<string>,

  read(locale: string): ?CatalogType,
  readAll(): AllCatalogsType,
  merge(
    prevCatalogs: AllCatalogsType,
    catalog: CatalogType,
    options?: { [key: string]: any }
  ): AllCatalogsType,
  write(locale: string, catalog: CatalogType): IdempotentResult<string>,
  writeCompiled(locale: string, content: string): string,

  getTranslation(
    catalogs: AllCatalogsType,
    locale: string,
    msgId: string,
    options: getTranslationOptions
  ): ?string,

  formatFilename(pattern: string, locale: string): string
}
