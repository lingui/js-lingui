import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import type { MessageDescriptor } from "./i18n"

const RUNTIME_MACRO_BRAND = Symbol.for("lingui.runtime.marker")

interface MacroMarker {
  readonly [RUNTIME_MACRO_BRAND]: true
  readonly format: "plural" | "select" | "selectordinal"
  readonly labeledName: string | null
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

function isLabeledExpression(x: unknown): x is Record<string, unknown> {
  if (typeof x !== "object" || x === null || Array.isArray(x)) return false
  if (isMacroMarker(x)) return false
  const proto = Object.getPrototypeOf(x)
  if (proto !== Object.prototype && proto !== null) return false
  const keys = Object.keys(x)
  return keys.length === 1
}

function isTemplateStringsArray(x: unknown): x is TemplateStringsArray {
  return Array.isArray(x) && "raw" in x && Array.isArray((x as any).raw)
}

function buildICUFragment(marker: MacroMarker, name: string): string {
  return `{${name}, ${marker.format}, ${marker.formattedOptions}}`
}

function buildChoiceMarker(
  format: "plural" | "select" | "selectordinal",
  valueOrLabeled: unknown,
  options: Record<string, unknown>,
): MacroMarker & MessageDescriptor {
  let labeledName: string | null = null
  let value: unknown

  if (isLabeledExpression(valueOrLabeled)) {
    labeledName = Object.keys(valueOrLabeled)[0]
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

export function t(
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

      if (isMacroMarker(expr)) {
        const name = expr.labeledName ?? String(positionalIndex++)
        message += buildICUFragment(expr, name)
        values[name] = expr.value
        Object.assign(values, expr.nestedValues)
      } else if (isLabeledExpression(expr)) {
        const key = Object.keys(expr)[0]
        values[key] = (expr as Record<string, unknown>)[key]
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
