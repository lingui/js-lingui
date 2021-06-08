import * as t from "@babel/types"
import generate, { GeneratorOptions } from "@babel/generator"
import { parse } from "messageformat-parser"
import * as R from "ramda"

import pseudoLocalize from "./pseudoLocalize"

export type CompiledCatalogNamespace = "cjs" | "es" | "ts" | string

type CompiledCatalogType = {
  [msgId: string]: string
}

export type CreateCompileCatalogOptions = {
  strict?: boolean
  namespace?: CompiledCatalogNamespace
  pseudoLocale?: string
  compilerBabelOptions?: GeneratorOptions
  pure?: boolean
}

export function createCompiledCatalog(
  locale: string,
  messages: CompiledCatalogType,
  options: CreateCompileCatalogOptions
) {
  const { strict = false, namespace = "cjs", pseudoLocale, compilerBabelOptions = {}, pure = false } = options
  const compiledMessages = R.keys(messages).map((key: string) => {
    // Don't use `key` as a fallback translation in strict mode.
    let translation = messages[key] || (!strict ? key : "")

    if (locale === pseudoLocale) {
      translation = pseudoLocalize(translation)
    }

    return t.objectProperty(t.stringLiteral(key), compile(translation))
  })

  const ast = pure ? t.objectExpression(compiledMessages) :  buildExportStatement(
    t.objectExpression(compiledMessages),
    namespace
  )

  const code = generate(ast, {
    minified: true,
    jsescOption: {
      minimal: true,
    },
    ...compilerBabelOptions,
  }).code

  return pure ? JSON.parse(code) : ("/*eslint-disable*/" + code)
}

function buildExportStatement(expression, namespace: CompiledCatalogNamespace) {
  if (namespace === "es" || namespace === "ts") {
    // export const messages = { message: "Translation" }
    return t.exportNamedDeclaration(
      t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("messages"), expression),
      ])
    )
  } else {
    let exportExpression = null
    const matches = namespace.match(/^(window|global)\.([^.\s]+)$/)
    if (namespace === "cjs") {
      // module.exports.messages = { message: "Translation" }
      exportExpression = t.memberExpression(
        t.identifier("module"),
        t.identifier("exports")
      )
    } else if (matches) {
      // window.i18nMessages = { messages: { message: "Translation" }}
      exportExpression = t.memberExpression(
        t.identifier(matches[1]),
        t.identifier(matches[2])
      )
    } else {
      throw new Error(`Invalid namespace param: "${namespace}"`)
    }

    return t.expressionStatement(
      t.assignmentExpression(
        "=",
        exportExpression,
        t.objectExpression([
          t.objectProperty(t.identifier("messages"), expression),
        ])
      )
    )
  }
}

/**
 * Compile string message into AST tree. Message format is parsed/compiled into
 * JS arrays, which are handled in client.
 */
export function compile(message: string) {
  let tokens

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

function processTokens(tokens) {
  // Shortcut - if the message doesn't include any formatting,
  // simply join all string chunks into one message
  if (!tokens.filter((token) => !isString(token)).length) {
    return tokens.join("")
  }

  return t.arrayExpression(
    tokens.map((token) => {
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

      token.cases.forEach((item) => {
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

const isString = (s) => typeof s === "string"
