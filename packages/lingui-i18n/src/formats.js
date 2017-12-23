// @flow
type NumberFormat = string | {}
type DateFormat = string | {}

type IntlType = {|
  DateTimeFormat: Function,
  NumberFormat: Function
|}

declare var Intl: IntlType

export function date(
  language: string,
  format?: DateFormat = {}
): (value: string) => string {
  const formatter = new Intl.DateTimeFormat(language, format)
  return value => formatter.format(value)
}

export function number(
  language: string,
  format?: NumberFormat = {}
): (value: number) => string {
  const formatter = new Intl.NumberFormat(language, format)
  return value => formatter.format(value)
}
