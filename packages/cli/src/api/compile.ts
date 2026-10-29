import * as t from "@babel/types"
import { GeneratorOptions, generate } from "@babel/generator"
import {
  CompiledMessage,
  compileMessageOrThrow,
} from "@lingui/message-utils/compileMessage"
import type { PseudoLocaleOptions } from "@lingui/conf"
import pseudoLocalize from "./pseudoLocalize.js"

export type CompiledCatalogNamespace = "cjs" | "es" | "ts" | "json" | string

type CompiledCatalogType = {
  [msgId: string]: string
}

export type CreateCompileCatalogOptions = {
  strict?: boolean
  namespace?: CompiledCatalogNamespace
  pseudoLocale?: string
  pseudoLocaleOptions?: PseudoLocaleOptions
  compilerBabelOptions?: GeneratorOptions
  outputPrefix?: string
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

const PLURAL_CASE_TYPES = ["plural", "selectordinal", "select"] as const
const EXACT_MATCH_CASE = /^\d+(\.\d+)?$/

/**
 * Returns plural categories available for the locale, or `undefined` when
 * the locale is unknown to `Intl.PluralRules` and categories can't be verified.
 *
 * Uses the same data as the runtime (`@lingui/core` resolves plurals with
 * `Intl.PluralRules`), so a message that passes validation here is guaranteed
 * to have a matching case at runtime.
 */
function getPluralCategories(
  locale: string,
  type: "cardinal" | "ordinal",
): Set<string> | undefined {
  try {
    if (Intl.PluralRules.supportedLocalesOf([locale]).length === 0) {
      return undefined
    }

    return new Set(
      new Intl.PluralRules(locale, { type }).resolvedOptions().pluralCategories,
    )
  } catch {
    return undefined
  }
}

/**
 * Validates plural cases of a compiled message against the locale:
 *
 * - every `plural`, `selectordinal` and `select` argument must define
 *   the fallback `other` case (required by the ICU message format),
 * - non-exact cases of `plural`/`selectordinal` arguments must be plural
 *   categories of the target locale (e.g. `two` is never matched for `en`
 *   cardinals, which only have `one` and `other`).
 *
 * Returns an `Error` listing all problems, or `undefined` if the message is valid.
 */
export function validateCompiledMessage(
  message: CompiledMessage,
  locale: string,
): Error | undefined {
  const cardinalCategories = getPluralCategories(locale, "cardinal")
  const ordinalCategories = getPluralCategories(locale, "ordinal")
  const problems: string[] = []

  const validateTokens = (tokens: CompiledMessage) => {
    for (const token of tokens) {
      if (typeof token === "string") continue

      const [, type, format] = token
      if (
        !type ||
        !(PLURAL_CASE_TYPES as readonly string[]).includes(type) ||
        !format ||
        typeof format !== "object"
      ) {
        continue
      }

      const [arg] = token
      const cases = format as Record<string, CompiledMessage>
      const caseKeys = Object.keys(cases).filter((key) => key !== "offset")

      if (!caseKeys.includes("other")) {
        problems.push(
          `\`${type}\` argument "${arg}" is missing the required \`other\` case`,
        )
      }

      if (type !== "select") {
        const categories =
          type === "plural" ? cardinalCategories : ordinalCategories

        if (categories) {
          for (const key of caseKeys) {
            if (EXACT_MATCH_CASE.test(key) || categories.has(key)) continue

            problems.push(
              `\`${type}\` argument "${arg}" has case "${key}", which is not a valid plural category for locale "${locale}" (valid: ${[...categories].join(", ")})`,
            )
          }
        }
      }

      for (const key of caseKeys) {
        validateTokens(cases[key])
      }
    }
  }

  validateTokens(message)

  if (problems.length) {
    return new Error(problems.join("; "))
  }

  return undefined
}

export function createCompiledCatalog(
  locale: string,
  messages: CompiledCatalogType,
  options: CreateCompileCatalogOptions,
): { source: string; errors: MessageCompilationError[] } {
  const {
    strict = false,
    namespace = "cjs",
    pseudoLocale,
    pseudoLocaleOptions,
    compilerBabelOptions = {},
    outputPrefix = "/*eslint-disable*/",
  } = options
  const shouldPseudolocalize = locale === pseudoLocale

  const errors: MessageCompilationError[] = []

  const compiledMessages = Object.keys(messages)
    .sort()
    .reduce<{
      [msgId: string]: CompiledMessage
    }>((obj, key: string) => {
      // Don't use `key` as a fallback translation in strict mode.
      const translation = (messages[key] || (!strict ? key : "")) as string

      try {
        const compiledMessage = compile(
          translation,
          shouldPseudolocalize,
          pseudoLocaleOptions,
        )
        obj[key] = compiledMessage

        const validationError = validateCompiledMessage(compiledMessage, locale)
        if (validationError) {
          errors.push({
            id: key,
            source: translation,
            error: validationError,
          })
        }
      } catch (e) {
        errors.push({
          id: key,
          source: translation,
          error: e as Error,
        })
      }

      return obj
    }, {})

  if (namespace === "json") {
    return { source: JSON.stringify({ messages: compiledMessages }), errors }
  }

  const ast = buildExportStatement(
    //build JSON.parse(<compiledMessages>) statement
    t.callExpression(
      t.memberExpression(t.identifier("JSON"), t.identifier("parse")),
      [t.stringLiteral(JSON.stringify(compiledMessages))],
    ),
    namespace,
  )

  const code = generate(ast, {
    minified: true,
    jsescOption: {
      minimal: true,
    },
    ...compilerBabelOptions,
  }).code

  return { source: `${outputPrefix}` + code, errors }
}

function buildExportStatement(
  expression: t.Expression,
  namespace: CompiledCatalogNamespace,
) {
  if (namespace === "ts") {
    // import type { Messages } from "@lingui/core";
    const importMessagesTypeDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier("Messages"), t.identifier("Messages"))],
      t.stringLiteral("@lingui/core"),
    )
    importMessagesTypeDeclaration.importKind = "type"

    // Cast the expression to `Messages`
    const castExpression = t.tsAsExpression(
      expression,
      t.tsTypeReference(t.identifier("Messages")),
    )

    // export const messages = ({ message: "Translation" } as Messages)
    const exportDeclaration = t.exportNamedDeclaration(
      t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("messages"), castExpression),
      ]),
    )

    return t.program([importMessagesTypeDeclaration, exportDeclaration])
  } else if (namespace === "es") {
    // export const messages = { message: "Translation" }
    return t.exportNamedDeclaration(
      t.variableDeclaration("const", [
        t.variableDeclarator(t.identifier("messages"), expression),
      ]),
    )
  } else {
    let exportExpression: t.MemberExpression
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
        t.identifier(matches[1]!),
        t.identifier(matches[2]!),
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
        ]),
      ),
    )
  }
}

/**
 * Compile string message into AST tree. Message format is parsed/compiled into
 * JS arrays, which are handled in client.
 */
export function compile(
  message: string,
  shouldPseudolocalize: boolean = false,
  pseudoLocaleOptions?: PseudoLocaleOptions,
) {
  return compileMessageOrThrow(message, (value) =>
    shouldPseudolocalize ? pseudoLocalize(value, pseudoLocaleOptions) : value,
  )
}
