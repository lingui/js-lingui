// @flow
export type IdempotentResult<T> = [ boolean, ?T ] // [ created, result ]

export interface CatalogFormat {
  addLocale(locale: string): IdempotentResult<string>,

  write(locale: string, messages: Object): void
}
