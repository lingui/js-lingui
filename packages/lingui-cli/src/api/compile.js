// @flow
const t = require('babel-types')
const { parse } = require('messageformat-parser')

const isString = s => typeof s === 'string'

function compile (message: string) {
  function processTokens (tokens, octothorpe) {
    if (!tokens.filter(token => !isString(token)).length) {
      return tokens.join('')
    }

    return t.arrayExpression(tokens.map(token => {
      if (isString(token)) {
        return t.stringLiteral(token)

      // # in plural case
      } else if (token.type === 'octothorpe') {
        return t.callExpression(arg, [t.stringLiteral(octothorpe)])

      // simple argument
      } else if (token.type === 'argument') {
        return t.callExpression(arg, [t.stringLiteral(token.arg)])

      // argument with custom format (date, number)
      } else if (token.type === 'function') {
        const params = [
          t.stringLiteral(token.arg),
          t.stringLiteral(token.key)
        ]

        const format = token.params[0]
        if (format) {
          params.push(t.stringLiteral(format))
        }
        return t.callExpression(arg, params)
      }

      // complex argument with cases
      const formatProps = []

      token.cases.forEach(item => {
        const inlineTokens = processTokens(item.tokens, token.arg)
        formatProps.push(t.objectProperty(
          t.identifier(item.key),
          isString(inlineTokens) ? t.stringLiteral(inlineTokens) : inlineTokens
        ))
      })

      const params = [
        t.stringLiteral(token.arg),
        t.stringLiteral(token.type),
        t.objectExpression(formatProps)
      ]

      return t.callExpression(arg, params)
    }))
  }

  const arg = t.identifier('a')

  const tokens = parse(message)
  const ast = processTokens(tokens)

  if (isString(ast)) return t.stringLiteral(ast)

  return t.functionExpression(
    null,
    [arg],
    t.blockStatement(
      [t.returnStatement(ast)]
    )
  )
}

export default compile
