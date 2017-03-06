// @flow
type DateFormat = string | {}

function date (language: string, format?: DateFormat = {}): (value: string) => string {
  const formatter = new Intl.DateTimeFormat(language, format)
  return value => formatter.format(value)
}

export default date
