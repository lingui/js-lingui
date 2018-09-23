// @flow
import { I18nProvider, I18n } from "./I18nProvider"
import Trans from "./Trans"

import withI18n from "./withI18n"
import createFormat from "./createFormat"
import { date, number } from "@lingui/core"

const DateFormat = createFormat(date)
const NumberFormat = createFormat(number)

export { withI18n, I18nProvider, I18n, Trans, DateFormat, NumberFormat }
