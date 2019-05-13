import { I18nProvider, I18n } from "./I18nProvider"
import Trans from "./Trans"

import { withI18n, withI18nForPure } from "./withI18n"
import createFormat from "./createFormat"
import { formats, setupI18n } from "@lingui/core"

const DateFormat = createFormat(formats.date)
const NumberFormat = createFormat(formats.number)

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
