import * as t from "@babel/types"
import { parse } from "messageformat-parser"
import { parseExpression } from "@babel/parser"
import generate from "@babel/generator"
import plurals from "make-plural"
import R from "ramda"

import { CatalogType } from "./types"
import pseudoLocalize from "./pseudoLocalize"

const isString = s => typeof s === "string"

export function compile(message: string) {
  const arg = t.identifier("a")

  let tokens
  try {
    tokens = parse(message)
  } catch (e) {
    throw new Error(
      `Can't parse message. Please check correct syntax: "${message}"`
    )
  }
  const ast = processTokens(tokens, arg)

  if (isString(ast)) return t.stringLiteral(ast)

  return t.functionExpression(
    null,
    [arg],
    t.blockStatement([t.returnStatement(ast)])
  )
}

function processTokens(tokens, arg) {
  if (!tokens.filter(token => !isString(token)).length) {
    return tokens.join("")
  }

  return t.arrayExpression(
    tokens.map(token => {
      if (isString(token)) {
        return t.stringLiteral(token)

        // # in plural case
      } else if (token.type === "octothorpe") {
        return t.stringLiteral("#")

        // simple argument
      } else if (token.type === "argument") {
        return t.callExpression(arg, [t.stringLiteral(token.arg)])

        // argument with custom format (date, number)
      } else if (token.type === "function") {
        const params = [t.stringLiteral(token.arg), t.stringLiteral(token.key)]

        const format = token.params[0]
        if (format) {
          params.push(t.stringLiteral(format))
        }
        return t.callExpression(arg, params)
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

      token.cases.forEach(item => {
        const inlineTokens = processTokens(item.tokens, arg)
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
        t.objectExpression(formatProps)
      ]

      return t.callExpression(arg, params)
    })
  )
}

function buildExportStatement(expression, namespace: string = "cjs") {
  namespace = namespace.trim()
  if (namespace === "es") {
    return t.ExportDefaultDeclaration(expression)
  } else {
    let exportExpression = null
    const matches = namespace.match(/^(window|global)\.([^.\s]+)$/)
    if (namespace === "cjs") {
      exportExpression = t.memberExpression(
        t.identifier("module"),
        t.identifier("exports")
      )
    } else if (matches) {
      exportExpression = t.memberExpression(
        t.identifier(matches[1]),
        t.identifier(matches[2])
      )
    } else {
      throw new Error(`Invalid namespace param: "${namespace}"`)
    }
    return t.expressionStatement(
      t.assignmentExpression("=", exportExpression, expression)
    )
  }
}

export function createCompiledCatalog(
  locale: string,
  messages: CatalogType,
  { strict = false, namespace = "cjs", pseudoLocale }: Object = {}
) {
  const [language] = locale.split(/[_-]/)
  let pluralRules = plurals[language]
  if (locale === pseudoLocale) {
    pluralRules = plurals["en"]
  }

  const compiledMessages = R.keys(messages).map(key => {
    let translation = messages[key] || (!strict ? key : "")
    if (locale === pseudoLocale) {
      translation = pseudoLocalize(translation)
    }
    return t.objectProperty(t.stringLiteral(key), compile(translation))
  })

  const localeData = [
    t.objectProperty(
      t.stringLiteral("plurals"),
      parseExpression(pluralRules.toString())
    )
  ]

  const ast = buildExportStatement(
    t.objectExpression([
      // language data
      t.objectProperty(
        t.identifier("localeData"),
        t.objectExpression(localeData)
      ),
      // messages
      t.objectProperty(
        t.identifier("messages"),
        t.objectExpression(compiledMessages)
      )
    ]),
    namespace
  )

  return (
    "/* eslint-disable */" +
    generate(ast, {
      minified: true
    }).code
  )
}
