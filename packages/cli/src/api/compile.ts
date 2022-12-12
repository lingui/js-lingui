import * as t from "@babel/types"
import generate, {GeneratorOptions} from "@babel/generator"
import {compileMessage} from "@lingui/core/compile"
import pseudoLocalize from "./pseudoLocalize"
import { parse as babelParse } from "@babel/parser"

export type CompiledCatalogNamespace = "cjs" | "es" | "ts" | string

type CompiledCatalogType = {
  [msgId: string]: string | object
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
  plurals: string,
  options: CreateCompileCatalogOptions
): string {
  const {strict = false, namespace = "cjs", pseudoLocale, compilerBabelOptions = {}} = options
  const shouldPseudolocalize = locale === pseudoLocale

  const compiledMessages = Object.keys(messages).reduce((obj, key: string) => {
    const value = messages[key]

    // If the current ID's value is a context object, create a nested
    // expression, and assign the current ID to that expression
    if (typeof value === "object") {
      obj[key] = Object.keys(value).reduce((obj, contextKey) => {
        obj[contextKey] = compile(value[contextKey], shouldPseudolocalize)
        return obj
      }, {})

      return obj
    }

    // Don't use `key` as a fallback translation in strict mode.
    const translation = (messages[key] || (!strict ? key : "")) as string

    obj[key] = compile(translation, shouldPseudolocalize)
    return obj
  }, {})

  const ast = buildExportStatement(
    {
      //build JSON.parse(<compiledMessages>) statement
      messages: t.callExpression(
          t.memberExpression(
            t.identifier('JSON'), t.identifier('parse')
          ),
          [t.stringLiteral(JSON.stringify(compiledMessages))]
        ),
      plurals: buildPluralFunctionStatement(plurals),
    },
    namespace
  )

  const code = generate(ast, {
    minified: true,
    jsescOption: {
      minimal: true
    },
    ...compilerBabelOptions
  }).code

  return "/*eslint-disable*/" + code;
}

function buildPluralFunctionStatement(block: string) {
  const exp = (babelParse(block).program.body[0]);

  // (n, ord) => {...}
  if (t.isExpressionStatement(exp)) {
    return exp.expression;
  }

  // function en(n, ord) => {...}
  if (t.isFunctionDeclaration(exp)) {
    return t.functionExpression(exp.id, exp.params, exp.body)
  }

  throw new Error('Plural rule fn passed to the createCompiledCatalog is malformed');
}

function buildExportStatement(exports: { [identifier: string]: t.Expression }, namespace: CompiledCatalogNamespace) {
  if (namespace === "es" || namespace === "ts") {
    // export const messages = { message: "Translation" }
    return t.program(
      Object.keys(exports).map((identifier) => {
        return t.exportNamedDeclaration(
          t.variableDeclaration("const", [
            t.variableDeclarator(t.identifier(identifier), exports[identifier]),
          ]),
        )
      }),
    )
  } else {
    let exportExpression = null
    const matches = namespace.match(/^(window|global)\.([^.\s]+)$/)
    if (namespace === "cjs") {
      // module.exports.messages = { message: "Translation" }
      exportExpression = t.memberExpression(
        t.identifier("module"),
        t.identifier("exports"),
      )
    } else if (matches) {
      // window.i18nMessages = { messages: { message: "Translation" }}
      exportExpression = t.memberExpression(
        t.identifier(matches[1]),
        t.identifier(matches[2]),
      )
    } else {
      throw new Error(`Invalid namespace param: "${namespace}"`)
    }

    return t.expressionStatement(
      t.assignmentExpression(
        "=",
        exportExpression,
        t.objectExpression(
          Object.keys(exports).map((identifier) => {
            return t.objectProperty(t.identifier(identifier), exports[identifier])
          }),
        ),
      ),
    )
  }
}

/**
 * Compile string message into AST tree. Message format is parsed/compiled into
 * JS arrays, which are handled in client.
 */
export function compile(message: string, shouldPseudolocalize: boolean = false) {
  return compileMessage(message, (value) =>
    shouldPseudolocalize ? pseudoLocalize(value) : value
  )
}
