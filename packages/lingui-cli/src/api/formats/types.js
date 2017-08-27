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
  [key: string]: MessageType
}

export type AllCatalogsType = {
  [key: string]: CatalogType
}

export type CatalogFormat = {|
  getLocales(): Array<string>,
  addLocale(locale: string): IdempotentResult<string>,

  read(locale: string): ?CatalogType,
  write(locale: string, catalog: CatalogType): IdempotentResult<string>,
  merge(catalog: CatalogType): AllCatalogsType,

  formatFilename (pattern: string, locale: string): string,
|}
