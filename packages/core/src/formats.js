// @flow
import { isString } from "./essentials"

import type { Locales } from "./i18n"

export type NumberFormat = string | {}
export type DateFormat = string | {}

export type IntlType = {|
  DateTimeFormat: Function,
  NumberFormat: Function
|}

declare var Intl: IntlType

export function date(
  locales: Locales,
  format?: DateFormat = {}
): (value: string | Date) => string {
  const formatter = new Intl.DateTimeFormat(locales, format)
  return value => {
    if (isString(value)) value = new Date(value)
    return formatter.format(value)
  }
}

export function number(
  locales: Locales,
  format?: NumberFormat = {}
): (value: number) => string {
  const formatter = new Intl.NumberFormat(locales, format)
  return value => formatter.format(value)
}
