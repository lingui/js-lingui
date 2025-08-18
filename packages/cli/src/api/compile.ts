import * as t from "@babel/types"
import generate, { GeneratorOptions } from "@babel/generator"
import {
  CompiledMessage,
  compileMessageOrThrow,
} from "@lingui/message-utils/compileMessage"
import pseudoLocalize from "./pseudoLocalize"
import type { FunctionThread, Pool } from "threads"
import type { CompileWorkerFunction } from "../workers/compileWorker"

export type CompiledCatalogNamespace = "cjs" | "es" | "ts" | "json" | string

type CompiledCatalogType = {
  [msgId: string]: string
}

export type CreateCompileCatalogOptions = {
  strict?: boolean
  namespace?: CompiledCatalogNamespace
  pseudoLocale?: string
  compilerBabelOptions?: GeneratorOptions
  pool?: Pool<CompileFunctionThread>
}

export type MessageCompilationError = {
  /**
   * ID of the message in the Catalog
   */
  id: string
  /**
   * Message itself
   */
  source: string
  /**
   * Error associated with this message
   */
  error: Error
}

function sortCompiledMessages(messages: { [msgId: string]: CompiledMessage }): { [msgId: string]: CompiledMessage } {
  const sortedMessages: { [msgId: string]: CompiledMessage } = {}
  const sortedKeys = Object.keys(messages).sort()
  
  for (const key of sortedKeys) {
    sortedMessages[key] = messages[key]
  }
  
  return sortedMessages
}

export async function createCompiledCatalog(
  locale: string,
  messages: CompiledCatalogType,
  options: CreateCompileCatalogOptions
): Promise<{ source: string; errors: MessageCompilationError[] }> {
  const {
    strict = false,
    namespace = "cjs",
    pseudoLocale,
    pool,
    compilerBabelOptions = {},
  } = options
  const shouldPseudolocalize = locale === pseudoLocale

  const errors: MessageCompilationError[] = []

  const compiledMessages = pool ? 
    await compileMessagesInParallel(messages, strict, shouldPseudolocalize, errors, pool) :
    compileMessages(messages, strict, shouldPseudolocalize, errors)
  const sortedCompiledMessages = sortCompiledMessages(compiledMessages)

  if (namespace === "json") {
    return { source: JSON.stringify({ messages: sortedCompiledMessages }), errors }
  }

  const ast = buildExportStatement(
    // build JSON.parse(<compiledMessages>) statement
    t.callExpression(
      t.memberExpression(t.identifier("JSON"), t.identifier("parse")),
      [t.stringLiteral(JSON.stringify(sortedCompiledMessages))]
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

  return { source: "/*eslint-disable*/" + code, errors }
}

function compileMessages(
  messages: CompiledCatalogType,
  strict: boolean,
  shouldPseudolocalize: boolean,
  errors: MessageCompilationError[]
): { [msgId: string]: CompiledMessage } {
  return Object.keys(messages)
    .sort()
    .reduce<{
      [msgId: string]: CompiledMessage
    }>((obj, key: string) => {
      // Don't use `key` as a fallback translation in strict mode.
      const translation = (messages[key] || (!strict ? key : "")) as string

      try {
        obj[key] = compile(translation, shouldPseudolocalize)
      } catch (e) {
        errors.push({
          id: key,
          source: translation,
          error: e as Error,
        })
      }

      return obj
    }, {})
}

async function compileMessagesInParallel(
  messages: CompiledCatalogType,
  strict: boolean,
  shouldPseudolocalize: boolean,
  errors: MessageCompilationError[],
  pool: Pool<CompileFunctionThread>
) {
  const messageIDs = Object.keys(messages).sort()
  let obj: { [msgId: string]: CompiledMessage } = {}

  messageIDs.map(id => pool.queue(async (c) => {
    const translation = (messages[id] || (!strict ? id : "")) as string

    const result = await c(translation, shouldPseudolocalize)
    if (result.error) {
      errors.push({
        id,
        source: translation,
        error: result.error,
      })
      return
    }
    obj[id] = result.result!
  }))

  await pool.completed(true)

  // sort obj by id
  obj = Object.fromEntries(Object.entries(obj).sort((a, b) => a[0].localeCompare(b[0])))

  return obj
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
  return compileMessageOrThrow(message, (value) =>
    shouldPseudolocalize ? pseudoLocalize(value) : value
  )
}

export type CompileFunctionThread = FunctionThread<Parameters<CompileWorkerFunction>, ReturnType<CompileWorkerFunction>>