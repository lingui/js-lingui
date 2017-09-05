// @flow
type DateFormat = string | {}

type IntlType = {|
  DateTimeFormat: Function
|};

declare var Intl: IntlType

function date (language: string, format?: DateFormat = {}): (value: string) => string {
  const formatter = new Intl.DateTimeFormat(language, format)
  return value => formatter.format(value)
}

export default date
