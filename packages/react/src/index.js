// @flow
import { I18nProvider, I18n } from "./I18nProvider"
import Trans from "./Trans"

import { withI18n, withI18nForPure } from "./withI18n"
import createFormat from "./createFormat"
import { date, number, setupI18n } from "@lingui/core"

import type {
  Catalog,
  Catalogs,
  MessageOptions,
  LocaleData,
  I18n as I18nType,
  Locales
} from "@lingui/core"

const DateFormat = createFormat(date)
const NumberFormat = createFormat(number)

export {
  withI18n,
  withI18nForPure,
  I18nProvider,
  I18n,
  Trans,
  DateFormat,
  NumberFormat,
  setupI18n
}

export type { Catalog, Catalogs, MessageOptions, LocaleData, I18nType, Locales }
