// @flow
type NumberFormat = string | {}
type DateFormat = string | {}

type IntlType = {|
  DateTimeFormat: Function,
  NumberFormat: Function
|}

declare var Intl: IntlType

export function date(
  locales: string,
  format?: DateFormat = {}
): (value: string) => string {
  const formatter = new Intl.DateTimeFormat(locales, format)
  return value => formatter.format(value)
}

export function number(
  locales: string,
  format?: NumberFormat = {}
): (value: number) => string {
  const formatter = new Intl.NumberFormat(locales, format)
  return value => formatter.format(value)
}
