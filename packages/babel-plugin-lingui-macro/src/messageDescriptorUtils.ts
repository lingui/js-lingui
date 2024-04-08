import ICUMessageFormat, { Tokens, ParsedResult } from "./icu"
import { SourceLocation, ObjectProperty, ObjectExpression } from "@babel/types"
import { MESSAGE, ID, EXTRACT_MARK, COMMENT, CONTEXT } from "./constants"
import * as types from "@babel/types"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

function buildICUFromTokens(tokens: Tokens) {
  const messageFormat = new ICUMessageFormat()
  return messageFormat.fromTokens(tokens)
}

export function createMessageDescriptorFromTokens(
  tokens: Tokens,
  oldLoc?: SourceLocation,
  defaults: { id?: string; context?: string; comment?: string } = {},
  stripNonEssentialProps = true
) {
  const { message, values, jsxElements } = buildICUFromTokens(tokens)

  const properties: ObjectProperty[] = []

  properties.push(
    defaults.id
      ? createStringObjectProperty(ID, defaults.id)
      : createIdProperty(message, defaults.context)
  )

  if (!stripNonEssentialProps) {
    properties.push(createStringObjectProperty(MESSAGE, message))

    if (defaults.comment) {
      properties.push(createStringObjectProperty(COMMENT, defaults.comment))
    }

    if (defaults.context) {
      properties.push(createStringObjectProperty(CONTEXT, defaults.context))
    }
  }

  properties.push(createValuesProperty(values))
  properties.push(createComponentsProperty(jsxElements))

  return createMessageDescriptor(
    properties,
    // preserve line numbers for extractor
    oldLoc
  )
}

function createIdProperty(message: string, context?: string) {
  return createStringObjectProperty(ID, generateMessageId(message, context))
}

function createValuesProperty(values: ParsedResult["values"]) {
  const valuesObject = Object.keys(values).map((key) =>
    types.objectProperty(types.identifier(key), values[key])
  )

  if (!valuesObject.length) return

  return types.objectProperty(
    types.identifier("values"),
    types.objectExpression(valuesObject)
  )
}

function createComponentsProperty(values: ParsedResult["jsxElements"]) {
  const valuesObject = Object.keys(values).map((key) =>
    types.objectProperty(types.identifier(key), values[key])
  )

  if (!valuesObject.length) return

  return types.objectProperty(
    types.identifier("components"),
    types.objectExpression(valuesObject)
  )
}

// if (Object.keys(jsxElements).length) {
//   attributes.push(
//     this.types.jsxAttribute(
//       this.types.jsxIdentifier("components"),
//       this.types.jsxExpressionContainer(
//         this.types.objectExpression(
//           Object.keys(jsxElements).map((key) =>
//             this.types.objectProperty(
//               this.types.identifier(key),
//               jsxElements[key]
//             )
//           )
//         )
//       )
//     )
//   )
// }
export function createStringObjectProperty(key: string, value: string) {
  return types.objectProperty(types.identifier(key), types.stringLiteral(value))
}

function createMessageDescriptor(
  properties: ObjectProperty[],
  oldLoc?: SourceLocation
): ObjectExpression {
  const newDescriptor = types.objectExpression(properties.filter(Boolean))
  types.addComment(newDescriptor, "leading", EXTRACT_MARK)
  if (oldLoc) {
    newDescriptor.loc = oldLoc
  }

  return newDescriptor
}
