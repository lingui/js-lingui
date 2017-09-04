// @flow
type NumberFormat = string | {}

type IntlType = {|
  NumberFormat: Function
|};

const globalIntl: IntlType = typeof window === 'object' ? window.Intl : Intl

function number (language: string, format?: NumberFormat = {}): (value: number) => string {
  const formatter = new globalIntl.NumberFormat(language, format)
  return value => formatter.format(value)
}

export default number
