const flatten = arrays => [].concat.apply([], arrays)
const zip = (a, b) => a.map((item, index) => [item, b[index]])

const variableName = (variable, index) => {
  if (typeof variable === 'object' && Object.keys(variable).length === 1) {
    return variable
  } else {
    return { [index]: variable.toString() }
  }
}

const t = (i18n) => (strings, ...values) => {
  const params = values.reduce((acc, variable, index) => {
    Object.assign(acc, variableName(variable, index))
    return acc
  }, {})

  const keys = Object.keys(params).map((key) => `{${key}}`)
  const message = flatten(zip(strings, keys)).join('')
  return i18n.translate(message, params)
}

export default t
