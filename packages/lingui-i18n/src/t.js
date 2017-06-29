/* @flow */
const flatten = arrays => [].concat.apply([], arrays)
const zip = (a, b) => a.map((item, index) => [item, b[index]])

const t = (strings: Array<string>, ...values: Array<any>) => {
  return flatten(zip(strings, values)).join('')
}

export default t
