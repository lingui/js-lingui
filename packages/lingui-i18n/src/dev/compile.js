// @flow
import { parse } from 'messageformat-parser'
import { date, number } from 'lingui-formats'

import loadLanguageData from './loadLanguageData'

const isString = s => typeof s === 'string'

const isFunction = f => typeof f === 'function'

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
function context ({ language, params, formatStyles, languageData }: Object) {
  const formats = defaultFormats(language, languageData, formatStyles)

  const ctx = (name, type, format) => {
    const value = params[name]
    const formatted = formats[type](value, format)
    const message = isFunction(formatted) ? formatted(ctx) : formatted
    return Array.isArray(message) ? message.join('') : message
  }

  return ctx
}

const compileMessage = (message: string) => processTokens(parse(message))

// [Tokens] -> (CTX -> String)
function processTokens (tokens, octothorpe = {}): (Function) => string {
  if (!tokens.filter(token => !isString(token)).length) {
    return tokens.join('').trim()
  }

  return ctx => tokens.map(token => {
    if (isString(token)) {
      return token

      // # in plural case
    } else if (token.type === 'octothorpe') {
      const { name, offset = 0 } = octothorpe
      return ctx(name) - offset

      // simple argument
    } else if (token.type === 'argument') {
      return ctx(token.arg)

      // argument with custom format (date, number)
    } else if (token.type === 'function') {
      return ctx(token.arg, token.key, token.params[0])
    }

    const offset = token.offset ? parseInt(token.offset) : undefined

    // complex argument with cases
    const formatProps = {}
    token.cases.forEach(item => {
      formatProps[item.key] = processTokens(item.tokens, {
        name: token.arg,
        offset
      })
    })

    return ctx(token.arg, token.type, {
      offset,
      ...formatProps
    })
  })
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
): (Function | string) {
  let formattedMessage = message

  if (process.env.NODE_ENV !== 'production') {
    if (isString(message)) {
        // eslint-disable-next-line spaced-comment
        // $FlowIgnore: Yes, message is string, we're inside guard
        formattedMessage = /*#__PURE__*/compileMessage(message)
        // eslint-disable-next-line spaced-comment
        languageData = /*#__PURE__*/loadLanguageData(language)
    }
  }

  if (!isFunction(formattedMessage)) return formattedMessage

  return (params?: Object = {}) => {
    // $FlowIgnore: formattedMessage is always a function
    const message = formattedMessage(context({
      language, params, formatStyles, languageData
    }))
    return Array.isArray(message) ? message.join('').trim() : message
  }
}

