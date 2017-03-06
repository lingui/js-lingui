// @flow
type NumberFormat = string | {}

function number (language: string, format?: NumberFormat = {}): (value: number) => string {
  const formatter = new Intl.NumberFormat(language, format)
  return value => formatter.format(value)
}

export default number
