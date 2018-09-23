// @flow
import { date, number } from "@lingui/core"

import I18nProvider, {
  I18nCoreConsumer as I18n,
  I18nDefaultRenderConsumer
} from "./I18nProvider"
import Trans from "./Trans"

import createFormat from "./createFormat"
import withI18n from "./withI18n"

const DateFormat = createFormat(date)
const NumberFormat = createFormat(number)

export {
  withI18n,
  I18nProvider,
  I18n,
  I18nDefaultRenderConsumer,
  Trans,
  DateFormat,
  NumberFormat
}
