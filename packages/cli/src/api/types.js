// @flow

export type IdempotentResult<T> = [boolean, ?T] // [ created, result ]

export type MessageType = {
  translation: string,
  defaults: ?string,
  origin: Array<[number, string]>,
  description: ?string,
  comments: ?Array<string>,
  obsolete: boolean,
  flags: ?Array<string>
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
  ): ?string
}
