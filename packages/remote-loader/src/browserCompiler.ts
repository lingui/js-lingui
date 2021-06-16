import * as R from "ramda"
import * as t from "@babel/types"
import JSON5 from "json5"
import generate from "@babel/generator"
import { parse } from "messageformat-parser"

export function createBrowserCompiledCatalog(messages: Record<string, any>) {
  const compiledMessages = R.keys(messages).map((key) => {
    let translation = messages[key] || key

    return t.objectProperty(t.stringLiteral(key.toString()), compile(translation))
  })

  const ast = t.objectExpression(compiledMessages)
  const code =  generate(ast as any, {
    minified: true,
    jsescOption: {
      minimal: true,
    }
  }).code

  return JSON5.parse(code)
}

/**
 * Compile string message into AST tree. Message format is parsed/compiled into
 * JS arrays, which are handled in client.
 */
export function compile(message: string) {
  let tokens: any

  try {
    tokens = parse(message)
  } catch (e) {
    throw new Error(
      `Can't parse message. Please check correct syntax: "${message}" \n \n Messageformat-parser trace: ${e.message}`,
    )
  }
  const ast = processTokens(tokens)

  if (isString(ast)) return t.stringLiteral(ast)

  return ast
}

function processTokens(tokens: any) {
  // Shortcut - if the message doesn't include any formatting,
  // simply join all string chunks into one message
  if (!tokens.filter((token: any) => !isString(token)).length) {
    return tokens.join("")
  }

  return t.arrayExpression(
    tokens.map((token: any) => {
      if (isString(token)) {
        return t.stringLiteral(token)

        // # in plural case
      } else if (token.type === "octothorpe") {
        return t.stringLiteral("#")

        // simple argument
      } else if (token.type === "argument") {
        return t.arrayExpression([t.stringLiteral(token.arg)])

        // argument with custom format (date, number)
      } else if (token.type === "function") {
        const params = [t.stringLiteral(token.arg), t.stringLiteral(token.key)]

        const format = token.param && token.param.tokens[0]
        if (format) {
          params.push(t.stringLiteral(format.trim()))
        }
        return t.arrayExpression(params)
      }

      // complex argument with cases
      const formatProps = []

      if (token.offset) {
        formatProps.push(
          t.objectProperty(
            t.identifier("offset"),
            t.numericLiteral(parseInt(token.offset))
          )
        )
      }

      token.cases.forEach((item: any) => {
        const inlineTokens = processTokens(item.tokens)
        formatProps.push(
          t.objectProperty(
            t.identifier(item.key),
            isString(inlineTokens)
              ? t.stringLiteral(inlineTokens)
              : inlineTokens
          )
        )
      })

      const params = [
        t.stringLiteral(token.arg),
        t.stringLiteral(token.type),
        t.objectExpression(formatProps),
      ]

      return t.arrayExpression(params)
    })
  )
}

const isString = (s: any) => typeof s === "string"
