/* @flow */
import type { I18n } from './i18n'
import { annotateVariable } from './variables'

const flatten = arrays => [].concat.apply([], arrays)
const zip = (a, b) => a.map((item, index) => [item, b[index]])

const t = (i18n: I18n) => (strings: string | Array<string>, ...values) => {
  // used as a function
  if (typeof strings === 'string') {
    const message = strings
    const params = values[0] || {}
    return i18n.translate(message, params)
  }

  // used as a template tag
  const params = values.reduce((acc, variable, index) => {
    Object.assign(acc, annotateVariable(variable, index))
    return acc
  }, {})

  const keys = Object.keys(params).map((key) => `{${key}}`)
  const message = flatten(zip(strings, keys)).join('')
  return i18n.translate(message, params)
}

export default t
