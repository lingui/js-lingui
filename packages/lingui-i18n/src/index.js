// @flow
export { i18n, setupI18n } from "./i18n"
export { unpackCatalog } from "./loader"

export type { Catalog, Catalogs, Message, LanguageData, I18n } from "./i18n"

export const i18nMark = (id: string) => id
