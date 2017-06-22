// @flow
import { parse } from 'messageformat-parser'

import MakePlural from 'make-plural/make-plural'
MakePlural.load(
  require('make-plural/data/plurals.json'),
  require('make-plural/data/ordinals.json')
)

const isString = s => typeof s === 'string'

export const compileMessage = (message: string) => processTokens(parse(message))

export const loadLanguageData = (language: string) => {
  const plurals = new MakePlural(language, {
    cardinals: true,
    ordinals: true
  })

  return { plurals }
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
      ...formatProps
    })
  })
}
