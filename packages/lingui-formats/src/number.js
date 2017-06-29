// @flow
type NumberFormat = string | {}

type IntlType = {|
  NumberFormat: Function
|};
const globalIntl: IntlType = window.Intl

function number (language: string, format?: NumberFormat = {}): (value: number) => string {
  const formatter = new globalIntl.NumberFormat(language, format)
  return value => formatter.format(value)
}

export default number
