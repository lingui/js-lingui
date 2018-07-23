// @flow
type NumberFormat = string | {}
type DateFormat = string | {}

type IntlType = {|
  DateTimeFormat: Function,
  NumberFormat: Function
|}

declare var Intl: IntlType

export function date(
  locales?: ?string | string[],
  format?: DateFormat = {}
): (value: string | Date) => string {
  const formatter = new Intl.DateTimeFormat(locales, format)
  return value => {
    if (typeof value === "string") value = new Date(value)
    return formatter.format(value)
  }
}

export function number(
  locales?: ?string | string[],
  format?: NumberFormat = {}
): (value: number) => string {
  const formatter = new Intl.NumberFormat(locales, format)
  return value => formatter.format(value)
}
