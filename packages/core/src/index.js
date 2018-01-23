// @flow
export { i18n, setupI18n } from "./i18n"
export { date, number } from "./formats"

export type {
  Catalog,
  Catalogs,
  MessageOptions,
  LanguageData,
  I18n
} from "./i18n"

export const i18nMark = (id: string) => id
