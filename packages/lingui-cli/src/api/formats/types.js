// @flow

export type LinguiConfig = {|
  localeDir: string,
  srcPathDirs: Array<string>,
  srcPathIgnorePatterns: Array<string>
|}

export type IdempotentResult<T> = [ boolean, ?T ] // [ created, result ]

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
  fallbackLanguage: string
|}

export type CatalogFormat = {|
  getLocales(): Array<string>,
  addLocale(locale: string): IdempotentResult<string>,

  read(locale: string): ?CatalogType,
  merge(catalog: CatalogType): AllCatalogsType,
  write(locale: string, catalog: CatalogType): IdempotentResult<string>,
  writeCompiled(locale: string, content: string): ?string,

  getTranslation(
    catalogs: AllCatalogsType,
    locale: string,
    msgId: string,
    options: getTranslationOptions
  ): ?string,

  formatFilename (pattern: string, locale: string): string,
|}
