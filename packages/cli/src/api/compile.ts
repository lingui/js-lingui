import * as t from "@babel/types"
import generate, { GeneratorOptions } from "@babel/generator"
import {
  compileMessage,
  CompiledMessage,
} from "@lingui/message-utils/compileMessage"
import pseudoLocalize from "./pseudoLocalize"

export type CompiledCatalogNamespace = "cjs" | "es" | "ts" | "json" | string

type CompiledCatalogType = {
  [msgId: string]: string
}

export type CreateCompileCatalogOptions = {
  strict?: boolean
  namespace?: CompiledCatalogNamespace
  pseudoLocale?: string
  compilerBabelOptions?: GeneratorOptions
}

export function createCompiledCatalog(
  locale: string,
  messages: CompiledCatalogType,
  options: CreateCompileCatalogOptions
): string {
  const {
    strict = false,
    namespace = "cjs",
    pseudoLocale,
    compilerBabelOptions = {},
  } = options
  const shouldPseudolocalize = locale === pseudoLocale

  const compiledMessages = Object.keys(messages).reduce<{
    [msgId: string]: CompiledMessage
  }>((obj, key: string) => {
    // Don't use `key` as a fallback translation in strict mode.
    const translation = (messages[key] || (!strict ? key : "")) as string

    obj[key] = compile(translation, shouldPseudolocalize)
    return obj
  }, {})

  if (namespace === "json") {
    return JSON.stringify({ messages: compiledMessages })
  }

  const ast = buildExportStatement(
    //build JSON.parse(<compiledMessages>) statement
    t.callExpression(
      t.memberExpression(t.identifier("JSON"), t.identifier("parse")),
      [t.stringLiteral(JSON.stringify(compiledMessages))]
    ),
    namespace
  )

  const code = generate(ast, {
    minified: true,
    jsescOption: {
      minimal: true,
    },
    ...compilerBabelOptions,
  }).code

  return "/*eslint-disable*/" + code
}

function buildExportStatement(
  expression: t.Expression,
  namespace: CompiledCatalogNamespace
) {
  if (namespace === "ts") {
    // import type { Messages } from "@lingui/core";
    const importMessagesTypeDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier("Messages"), t.identifier("Messages"))],
      t.stringLiteral("@lingui/core")
    )
    importMessagesTypeDeclaration.importKind = "type"

    // Cast the expression to `Messages`
    const castExpression = t.tsAsExpression(
      expression,
      t.tsTypeReference(t.identifier("Messages"))
    )

    // export const messages = ({ message: "Translation" } as Messages)
    const exportDeclaration = t.exportNamedDeclaration(
      t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("messages"), castExpression),
      ])
    )

    return t.program([importMessagesTypeDeclaration, exportDeclaration])
  } else if (namespace === "es") {
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
export function compile(
  message: string,
  shouldPseudolocalize: boolean = false
) {
  return compileMessage(message, (value) =>
    shouldPseudolocalize ? pseudoLocalize(value) : value
  )
}
