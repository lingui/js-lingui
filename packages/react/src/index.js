// @flow
import { date, number } from "@lingui/core"

import I18nProvider from "./I18nProvider"
import I18n from "./I18n"
import Trans from "./Trans"

import createFormat from "./createFormat"
import withI18n from "./withI18n"

const DateFormat = withI18n()(createFormat(date))
const NumberFormat = withI18n()(createFormat(number))

export { withI18n, I18nProvider, I18n, Trans, DateFormat, NumberFormat }
