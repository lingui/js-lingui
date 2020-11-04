type Maybe<T> = T | null | undefined

export type IdempotentResult<T> = [boolean, Maybe<T>] // [ created, result ]

export type MessageOrigin = [string, number]

export type ExtractedMessageType = {
  message?: string
  origin?: MessageOrigin[]
  comment?: string
  comments?: string[]
  obsolete?: boolean
  flags?: string[]
  description?: string
}

export type MessageType = ExtractedMessageType & {
  translation: string
}

export type OrderByType = "messageId" | "origin"

export type CatalogType = {
  [msgId: string]: MessageType
}

export type ExtractedCatalogType = {
  [msgId: string]: ExtractedMessageType
}

export type CompiledCatalogType = {
  [msgId: string]: string
}

export type AllCatalogsType = {
  [locale: string]: CatalogType
}

export declare type FallbackLocales = { [locale: string]: string[] | string } | { default: string[] | string }

export type getTranslationOptions = {
  fallbackLocales: FallbackLocales
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
