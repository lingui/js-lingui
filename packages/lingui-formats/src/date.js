// @flow
type DateFormat = string | {}

type IntlType = {|
  DateTimeFormat: Function
|};
const globalIntl: IntlType = window.Intl

function date (language: string, format?: DateFormat = {}): (value: string) => string {
  const formatter = new globalIntl.DateTimeFormat(language, format)
  return value => formatter.format(value)
}

export default date
