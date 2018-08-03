// @flow
import { date, number } from "@lingui/core"

import I18nProvider from "./I18nProvider"
import Trans from "./Trans"
import { Plural, Select, SelectOrdinal } from "./Select"

import createFormat from "./createFormat"
import withI18n from "./withI18n"

const DateFormat = withI18n()(createFormat(date))
const NumberFormat = withI18n()(createFormat(number))

const i18nMark = (id: string) => id

export {
  i18nMark,
  withI18n,
  I18nProvider,
  Trans,
  Plural,
  Select,
  SelectOrdinal,
  DateFormat,
  NumberFormat
}
