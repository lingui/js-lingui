import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import type { MessageDescriptor } from "./i18n"

const RUNTIME_MACRO_BRAND = Symbol.for("lingui.runtime.marker")

interface MacroMarker {
  readonly [RUNTIME_MACRO_BRAND]: true
  readonly format: "plural" | "select" | "selectordinal"
  readonly labeledName: string
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
  if (isLabeledExpression(expr)) return

  if (isPlainObject(expr)) {
    const keys = Object.keys(expr)
    if (keys.length === 0) {
      throw new Error(
        `msg: Unexpected empty object at position ${position}. ` +
          `Use a labeled placeholder syntax: \${{ label: value }}.`,
      )
    }
    throw new Error(
      `msg: Object with multiple keys (${keys.join(", ")}) at position ${position}. ` +
        `You probably put a value directly into the message. This is not supported. ` +
        `Use a labeled placeholder syntax: \${{ label: value }}.`,
    )
  }

  if (typeof expr === "function") {
    throw new Error(
      `msg: A function was passed at position ${position}. ` +
        `Did you forget to call it? ` +
        `Use a labeled placeholder syntax: \${{ label: myFn() }}.`,
    )
  }

  const type = expr === undefined ? "undefined" : typeof expr
  throw new Error(
    `msg: A raw value (${type}) was passed at position ${position}. ` +
      `Passing values directly is not supported because variable names ` +
      `cannot be inferred at runtime. ` +
      `Use a labeled placeholder syntax: \${{ label: value }}.`,
  )
}

function isMessageDescriptor(x: unknown): x is MessageDescriptor {
  if (typeof x !== "object" || x === null) return false
  if (isMacroMarker(x)) return false
  return "id" in x && "message" in x
}

function isTemplateStringsArray(x: unknown): x is TemplateStringsArray {
  return Array.isArray(x) && "raw" in x && Array.isArray((x as any).raw)
}

function buildICUFragment(marker: MacroMarker, name: string): string {
  return `{${name}, ${marker.format}, ${marker.formattedOptions}}`
}

function validateChoiceValue(format: string, valueOrLabeled: unknown): void {
  if (isLabeledExpression(valueOrLabeled)) return

  if (isPlainObject(valueOrLabeled)) {
    const keys = Object.keys(valueOrLabeled)
    if (keys.length === 0) {
      throw new Error(
        `${format}(): Unexpected empty object as first argument. ` +
          `Use a labeled placeholder syntax: ${format}({ label: value }, { ... }).`,
      )
    }
    throw new Error(
      `${format}(): Object with multiple keys (${keys.join(", ")}) as first argument. ` +
        `You probably put a value directly. This is not supported. ` +
        `Use a labeled placeholder syntax: ${format}({ label: value }, { ... }).`,
    )
  }

  if (valueOrLabeled === undefined) {
    throw new Error(
      `${format}(): First argument is undefined. ` +
        `Use a labeled placeholder syntax: ${format}({ label: value }, { ... }).`,
    )
  }

  const type = typeof valueOrLabeled
  throw new Error(
    `${format}(): A raw value (${type}) was passed as first argument. ` +
      `Passing values directly is not supported because variable names ` +
      `cannot be inferred at runtime. ` +
      `Use a labeled placeholder syntax: ${format}({ label: value }, { ... }).`,
  )
}

function buildChoiceMarker(
  format: "plural" | "select" | "selectordinal",
  valueOrLabeled: unknown,
  options: Record<string, unknown>,
): MacroMarker & MessageDescriptor {
  validateChoiceValue(format, valueOrLabeled)

  const labeledName = Object.keys(
    valueOrLabeled as Record<string, unknown>,
  )[0] as string
  const value = (valueOrLabeled as Record<string, unknown>)[labeledName]

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
      const nestedName = optValue.labeledName
      const fragment = buildICUFragment(optValue, nestedName)
      nestedValues[nestedName] = optValue.value
      Object.assign(nestedValues, optValue.nestedValues)
      optionParts.push(`${formatKey} {${fragment}}`)
    } else if (isMessageDescriptor(optValue)) {
      const nested = optValue as MessageDescriptor
      optionParts.push(`${formatKey} {${nested.message ?? ""}}`)
      if (nested.values) {
        Object.assign(nestedValues, nested.values)
      }
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

  const message = buildICUFragment(marker, labeledName)
  const allValues: Record<string, unknown> = {
    [labeledName]: value,
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
      message?: unknown
      comment?: string
      context?: string
    }
    const context = desc.context

    let message: string
    let values: Record<string, unknown> | undefined

    const rawMessage = desc.message
    if (isMacroMarker(rawMessage)) {
      message = buildICUFragment(rawMessage, rawMessage.labeledName)
      values = {
        [rawMessage.labeledName]: rawMessage.value,
        ...rawMessage.nestedValues,
      }
    } else if (
      typeof rawMessage === "object" &&
      rawMessage !== null &&
      "message" in rawMessage
    ) {
      const nested = rawMessage as MessageDescriptor
      message = nested.message ?? ""
      values = nested.values
    } else {
      message = (rawMessage as string) ?? ""
    }

    const id = desc.id ?? generateMessageId(message, context)
    const result: MessageDescriptor = { id }
    if (message) result.message = message
    if (desc.comment) result.comment = desc.comment
    if (context) (result as any).context = context
    if (values && Object.keys(values).length > 0) result.values = values
    return result
  }

  const literals = literalsOrDescriptor
  let message = ""
  const values: Record<string, unknown> = {}

  for (let i = 0; i < literals.length; i++) {
    message += literals[i]

    if (i < expressions.length) {
      const expr = expressions[i]
      validateExpression(expr, i)

      if (isMacroMarker(expr)) {
        if (!expr.labeledName) {
          throw new Error(
            `msg: A macro marker (${expr.format}) without a labeled name at position ${i}. ` +
              `Use a labeled placeholder syntax: ${expr.format}({ label: value }, { ... }).`,
          )
        }
        message += buildICUFragment(expr, expr.labeledName)
        values[expr.labeledName] = expr.value
        Object.assign(values, expr.nestedValues)
      } else {
        const labeled = expr as Record<string, unknown>
        const key = Object.keys(labeled)[0] as string
        values[key] = labeled[key]
        message += `{${key}}`
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
