/* @flow */
import type { I18n, Message } from './i18n'

const flatten = arrays => [].concat.apply([], arrays)
const zip = (a, b) => a.map((item, index) => [item, b[index]])

const t = (i18n: I18n) => (strings: Message | Array<string>, ...values: Array<any>) => {
  // used as a function
  if (!Array.isArray(strings)) {
    const { id, params } = strings
    return i18n.translate({ id, params })
  }

  // used as a template tag
  return flatten(zip(strings, values)).join('')
}

export default t
