import * as t from "@babel/types"
import { parse } from "messageformat-parser"
import { parseExpression } from "@babel/parser"
import generate from "@babel/generator"
import * as plurals from "make-plural/plurals"
import R from "ramda"

import { CatalogType, CompiledCatalogType } from "./types"
import pseudoLocalize from "./pseudoLocalize"

const isString = s => typeof s === "string"

export function compile(message: string) {
  let tokens
  try {
    tokens = parse(message)
  } catch (e) {
    throw new Error(
      `Can't parse message. Please check correct syntax: "${message}"`
    )
  }
  const ast = processTokens(tokens)

  if (isString(ast)) return t.stringLiteral(ast)

  return ast
}

function processTokens(tokens) {
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

      token.cases.forEach(item => {
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
        t.objectExpression(formatProps)
      ]

      return t.arrayExpression(params)
    })
  )
}

function buildExportStatement(expression, namespace: NamespaceType = "cjs") {
  if (namespace === "es") {
    return t.exportDefaultDeclaration(expression)
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

type NamespaceType = "cjs" | "es" | string

interface CreateCompileCatalogOptions {
  strict: boolean
  namespace: NamespaceType
  pseudoLocale?: string
}

export function createCompiledCatalog(
  locale: string,
  messages: CompiledCatalogType,
  {
    strict = false,
    namespace = "cjs",
    pseudoLocale
  }: CreateCompileCatalogOptions
) {
  const [language] = locale.split(/[_-]/)
  let pluralRules = plurals[language]
  if (locale === pseudoLocale) {
    pluralRules = plurals["en"]
  }

  const compiledMessages = R.keys(messages).map((key: string) => {
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
    generate(ast as any, {
      minified: true
    }).code
  )
}
