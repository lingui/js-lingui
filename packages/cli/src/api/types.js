// @flow

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

export type FormatWriteOptions = {
  locale: string
}

export type MessageCatalogFormat = {
  catalogExtension: string,
  read(filename: string): ?CatalogType,
  write(filename: string, catalog: CatalogType, options?: FormatWriteOptions): void
}
