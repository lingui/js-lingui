import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import type { MessageDescriptor } from "./i18n"

const RUNTIME_MACRO_BRAND = Symbol.for("lingui.runtime.marker")

interface MacroMarker {
  readonly [RUNTIME_MACRO_BRAND]: true
  readonly format: "plural" | "select" | "selectordinal"
  readonly labeledName: string | undefined
  readonly value: unknown
  readonly formattedOptions: string
  readonly nestedValues: Record<string, unknown>
}

function isMacroMarker(x: unknown): x is MacroMarker {
  return (
    typeof x === "object" &&
    x !== null &&
    (x as any)[RUNTIME_MACRO_BRAND] === true
  )
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return false
  if (isMacroMarker(x)) return false
  const proto = Object.getPrototypeOf(x)
  return proto === Object.prototype || proto === null
}

function isLabeledExpression(x: unknown): x is Record<string, unknown> {
  if (!isPlainObject(x)) return false
  return Object.keys(x).length === 1
}

function validateExpression(expr: unknown, position: number): void {
  if (isMacroMarker(expr)) return
  if (typeof expr === "string" || typeof expr === "number") return
  if (isPlainObject(expr)) {
    const keys = Object.keys(expr)
    if (keys.length === 0) {
      throw new Error(
        `Invalid placeholder at position ${position}: empty object. ` +
          `Use {name: value} with exactly one property to create a named placeholder.`,
      )
    }
    if (keys.length > 1) {
      throw new Error(
        `Invalid placeholder at position ${position}: object has ${keys.length} properties (${keys.join(", ")}). ` +
          `Use {name: value} with exactly one property to create a named placeholder.`,
      )
    }
    return
  }
  if (typeof expr === "undefined") {
    throw new Error(
      `Invalid placeholder at position ${position}: value is undefined. ` +
        `Only strings, numbers, labeled placeholders {name: value}, or macro markers (plural/select) are allowed.`,
    )
  }
  if (typeof expr === "function") {
    throw new Error(
      `Invalid placeholder at position ${position}: value is a function. ` +
        `Did you forget to call it? Only strings, numbers, labeled placeholders {name: value}, or macro markers (plural/select) are allowed.`,
    )
  }
}

function isTemplateStringsArray(x: unknown): x is TemplateStringsArray {
  return Array.isArray(x) && "raw" in x && Array.isArray((x as any).raw)
}

function buildICUFragment(marker: MacroMarker, name: string): string {
  return `{${name}, ${marker.format}, ${marker.formattedOptions}}`
}

function validateChoiceValue(format: string, valueOrLabeled: unknown): void {
  if (valueOrLabeled === undefined) {
    throw new Error(
      `${format}(): first argument is undefined. ` +
        `Pass a value or a labeled placeholder {name: value}.`,
    )
  }
  if (isPlainObject(valueOrLabeled)) {
    const keys = Object.keys(valueOrLabeled)
    if (keys.length === 0) {
      throw new Error(
        `${format}(): first argument is an empty object. ` +
          `Use {name: value} with exactly one property to create a named placeholder.`,
      )
    }
    if (keys.length > 1) {
      throw new Error(
        `${format}(): first argument has ${keys.length} properties (${keys.join(", ")}). ` +
          `Use {name: value} with exactly one property to create a named placeholder.`,
      )
    }
  }
}

function buildChoiceMarker(
  format: "plural" | "select" | "selectordinal",
  valueOrLabeled: unknown,
  options: Record<string, unknown>,
): MacroMarker & MessageDescriptor {
  validateChoiceValue(format, valueOrLabeled)

  let labeledName: string | undefined
  let value: unknown

  if (isLabeledExpression(valueOrLabeled)) {
    labeledName = Object.keys(valueOrLabeled)[0] as string
    value = (valueOrLabeled as Record<string, unknown>)[labeledName]
  } else {
    value = valueOrLabeled
  }

  const nestedValues: Record<string, unknown> = {}
  let optCounter = 0
  const optionParts: string[] = []

  for (const [key, optValue] of Object.entries(options)) {
    if (key === "offset" && format !== "select") {
      optionParts.push(`offset:${optValue}`)
      continue
    }

    const formatKey = /^\d+$/.test(key) ? `=${key}` : key

    if (isMacroMarker(optValue)) {
      const nestedName = optValue.labeledName ?? `_nested${optCounter++}`
      const fragment = buildICUFragment(optValue, nestedName)
      nestedValues[nestedName] = optValue.value
      Object.assign(nestedValues, optValue.nestedValues)
      optionParts.push(`${formatKey} {${fragment}}`)
    } else if (typeof optValue === "string") {
      optionParts.push(`${formatKey} {${optValue}}`)
    } else {
      const tempName = `_opt${optCounter++}`
      nestedValues[tempName] = optValue
      optionParts.push(`${formatKey} {{${tempName}}}`)
    }
  }

  const formattedOptions = optionParts.join(" ")

  const marker: MacroMarker = {
    [RUNTIME_MACRO_BRAND]: true,
    format,
    labeledName,
    value,
    formattedOptions,
    nestedValues,
  }

  const standaloneName = labeledName ?? "0"
  const message = buildICUFragment(marker, standaloneName)
  const allValues: Record<string, unknown> = {
    [standaloneName]: value,
    ...nestedValues,
  }

  return Object.assign(marker, {
    id: generateMessageId(message),
    message,
    values: Object.keys(allValues).length > 0 ? allValues : undefined,
  }) as MacroMarker & MessageDescriptor
}

export function msg(
  literalsOrDescriptor: TemplateStringsArray | Record<string, unknown>,
  ...expressions: unknown[]
): MessageDescriptor {
  if (!isTemplateStringsArray(literalsOrDescriptor)) {
    const desc = literalsOrDescriptor as {
      id?: string
      message?: string
      comment?: string
      context?: string
    }
    const message = desc.message ?? ""
    const context = desc.context
    const id = desc.id ?? generateMessageId(message, context)
    const result: MessageDescriptor = { id }
    if (message) result.message = message
    if (desc.comment) result.comment = desc.comment
    if (context) (result as any).context = context
    return result
  }

  const literals = literalsOrDescriptor
  let message = ""
  const values: Record<string, unknown> = {}
  let positionalIndex = 0

  for (let i = 0; i < literals.length; i++) {
    message += literals[i]

    if (i < expressions.length) {
      const expr = expressions[i]
      validateExpression(expr, i)

      if (isMacroMarker(expr)) {
        const name = expr.labeledName ?? String(positionalIndex++)
        message += buildICUFragment(expr, name)
        values[name] = expr.value
        Object.assign(values, expr.nestedValues)
      } else if (isLabeledExpression(expr)) {
        const key = Object.keys(expr)[0] as string
        values[key] = expr[key]
        message += `{${key}}`
      } else {
        const name = String(positionalIndex++)
        values[name] = expr
        message += `{${name}}`
      }
    }
  }

  const id = generateMessageId(message)
  const result: MessageDescriptor = { id, message }
  if (Object.keys(values).length > 0) result.values = values
  return result
}

export function plural(
  value: unknown,
  options: Record<string, unknown>,
): MacroMarker & MessageDescriptor {
  return buildChoiceMarker("plural", value, options)
}

export function select(
  value: unknown,
  options: Record<string, unknown>,
): MacroMarker & MessageDescriptor {
  return buildChoiceMarker("select", value, options)
}

export function selectOrdinal(
  value: unknown,
  options: Record<string, unknown>,
): MacroMarker & MessageDescriptor {
  return buildChoiceMarker("selectordinal", value, options)
}

export const defineMessage = msg
