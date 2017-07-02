// @flow
import { date, number } from 'lingui-formats'

import createFormat from './createFormat'

import WithI18n from './WithI18n'
import type { WithI18nProps } from './WithI18n'
export { WithI18n }
export type { WithI18nProps }

export { default as I18nProvider } from './I18nProvider'
export { default as Trans } from './Trans'
export { default as Plural } from './Plural'
export { default as Select } from './Select'

export const DateFormat = WithI18n()(createFormat(date))
export const NumberFormat = WithI18n()(createFormat(number))
