// @flow
import { date, number } from "@lingui/core"

import createFormat from "./createFormat"

import withI18n from "./withI18n"
import type { withI18nProps } from "./withI18n"
export { withI18n }
export type { withI18nProps }

export { default as I18nProvider } from "./I18nProvider"
export { default as Trans } from "./Trans"
export { Plural, Select, SelectOrdinal } from "./Select"

export const DateFormat = withI18n()(createFormat(date))
export const NumberFormat = withI18n()(createFormat(number))

export const i18nMark = (id: string) => id
