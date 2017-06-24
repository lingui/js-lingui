// @flow
import { date, number } from 'lingui-formats'

import { compileMessage, loadLanguageData } from './utils.dev'

const isString = s => typeof s === 'string'

const isFunction: isFunctionType = f => typeof f === 'function'

const defaultFormats = (language, languageData = {}, formatStyles = {}) => {
  const { plurals } = languageData
  const style = format => isString(format)
    ? formatStyles[format] || { style: format }
    : format

  const replaceOctothorpe = (value, message) => {
    return ctx => {
      const msg = isFunction(message) ? message(ctx) : message
      const norm = Array.isArray(msg) ? msg : [msg]
      return norm.map(m => isString(m) ? m.replace('#', value) : m)
    }
  }

  return {
    plural: (value, { offset = 0, ...rules }) => {
      const message = rules[value] || rules[plurals(value - offset)]
      return replaceOctothorpe(value - offset, message)
    },

    selectordinal: (value, { offset = 0, ...rules }) => {
      const message = rules[value] || rules[plurals(value - offset, true)]
      return replaceOctothorpe(value - offset, message)
    },

    select: (value, rules) =>
      rules[value] || rules.other,

    number: (value, format) =>
      number(language, style(format))(value),

    date: (value, format) =>
      date(language, style(format))(value),

    undefined: value => value
  }
}

// Message -> (Params -> String)
/**
 * Compile message in given language and provide language data (e.g: plural)
 * with formatStyles. The result is a function which takes parameters and return
 * formatted message.
 *
 * @param language     - Language of message
 * @param message      - Message to parse and compile
 * @param languageData - Language data (e.g: plurals)
 * @param formatStyles - Custom format styles
 */
export default function compile (
  language: string,
  message: string | Function,
  languageData?: Object,
  formatStyles?: Object
): (params?: Object) => string {
  let formattedMessage = message

  if (isString(message)) {
    if (process.env.NODE_ENV !== 'production') {
      formattedMessage = /*#__PURE__*/compileMessage(message)
      languageData = /*#__PURE__*/loadLanguageData(language)
    } else {
      // constant message
      return (params?: Object) => message
    }
  }

  return (params?: Object = {}) => {
    // $FlowIgnore: formattedMessage is always a function
    const message = formattedMessage(context({
      language, params, formatStyles, languageData
    }))
    return Array.isArray(message) ? message.join('').trim() : message
  }
}

// Params -> CTX
/**
 * Creates a context object, which formats ICU MessageFormat arguments based on
 * argument type.
 *
 * @param language     - Language of message
 * @param params       - Parameters for variable interpolation
 * @param languageData - Language data (e.g: plurals)
 * @param formatStyles - Custom format styles
 * @returns {function(string, string, any)}
 */
function context ({ language, params, formatStyles, languageData }) {
  const formats = defaultFormats(language, languageData, formatStyles)

  const ctx = (name, type, format) => {
    const value = params[name]
    const formatted = formats[type](value, format)
    const message = isFunction(formatted) ? formatted(ctx) : formatted
    return Array.isArray(message) ? message.join('') : message
  }

  return ctx
}
