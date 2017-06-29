// @flow
import { parse } from 'messageformat-parser'
import { date, number } from 'lingui-formats'

// TODO: Remove in production
import MakePlural from 'make-plural/make-plural'
MakePlural.load(
  require('make-plural/data/plurals.json'),
  require('make-plural/data/ordinals.json')
)

const isString = s => typeof s === 'string'

const defaultFormats = (language, formatStyles = {}) => {
  // When language is undefined, skip plural rules.
  const pluralRules = language ? new MakePlural(language, {
    cardinals: true,
    ordinals: true
  }) : (value, ordinal) => null

  const style = format => isString(format) ? formatStyles[format] || { style: format } : format

  return {
    plural: (value, { offset = 0, rules }) =>
      rules[value] || rules[pluralRules(value - offset)] || rules.other,

    selectordinal: (value, { offset = 0, rules }) =>
      rules[value] || rules[pluralRules(value - offset, true)] || rules.other,

    select: (value, { rules }) =>
      rules[value] || rules.other,

    number: (value, format) =>
      number(language, style(format))(value),

    date: (value, format) =>
      date(language, style(format))(value),

    undefined: value => value
  }
}

// Message -> (Params -> String)
export default function compile (language: string, message: string, formatStyles?: Object) {
  const formattedMessage = processTokens(parse(message))
  return (params?: Object = {}) => formattedMessage(context({ language, params, formatStyles }))
}

// Params -> CTX
function context ({ language, params, formatStyles }: Object) {
  const formats = defaultFormats(language, formatStyles)

  const ctx = (name, type, format) => {
    const value = params[name]
    const formatted = formats[type](value, format)
    return typeof formatted === 'function' ? formatted(ctx) : formatted
  }

  return ctx
}

// [Tokens] -> (CTX -> String)
function processTokens (tokens, octothorpe = {}): (Function) => string {
  if (!tokens.filter(token => !isString(token)).length) {
    return () => tokens.join('').trim()
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
      rules: formatProps
    })
  }).join('').trim()
}
