import { ICUMessageFormat, Tokens, ParsedResult } from "./icu"
import {
  SourceLocation,
  ObjectProperty,
  ObjectExpression,
  isObjectProperty,
  Expression,
} from "@babel/types"
import { EXTRACT_MARK, MsgDescriptorPropKey } from "./constants"
import * as types from "@babel/types"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

function buildICUFromTokens(tokens: Tokens) {
  const messageFormat = new ICUMessageFormat()
  return messageFormat.fromTokens(tokens)
}

type TextWithLoc = {
  text: string
  loc?: SourceLocation
}

export function createMessageDescriptorFromTokens(
  tokens: Tokens,
  oldLoc: SourceLocation,
  stripNonEssentialProps: boolean,
  defaults: {
    id?: TextWithLoc | ObjectProperty
    context?: TextWithLoc | ObjectProperty
    comment?: TextWithLoc | ObjectProperty
  } = {}
) {
  return createMessageDescriptor(
    buildICUFromTokens(tokens),
    oldLoc,
    stripNonEssentialProps,
    defaults
  )
}

export function createMessageDescriptor(
  result: Partial<ParsedResult>,
  oldLoc: SourceLocation,
  stripNonEssentialProps: boolean,
  defaults: {
    id?: TextWithLoc | ObjectProperty
    context?: TextWithLoc | ObjectProperty
    comment?: TextWithLoc | ObjectProperty
  } = {}
) {
  const { message, values, elements } = result

  const properties: ObjectProperty[] = []

  properties.push(
    defaults.id
      ? isObjectProperty(defaults.id)
        ? defaults.id
        : createStringObjectProperty(
            MsgDescriptorPropKey.id,
            defaults.id.text,
            defaults.id.loc
          )
      : createIdProperty(
          message,
          defaults.context
            ? isObjectProperty(defaults.context)
              ? getTextFromExpression(defaults.context.value as Expression)
              : defaults.context.text
            : null
        )
  )

  if (!stripNonEssentialProps) {
    if (message) {
      properties.push(
        createStringObjectProperty(MsgDescriptorPropKey.message, message)
      )
    }

    if (defaults.comment) {
      properties.push(
        isObjectProperty(defaults.comment)
          ? defaults.comment
          : createStringObjectProperty(
              MsgDescriptorPropKey.comment,
              defaults.comment.text,
              defaults.comment.loc
            )
      )
    }

    if (defaults.context) {
      properties.push(
        isObjectProperty(defaults.context)
          ? defaults.context
          : createStringObjectProperty(
              MsgDescriptorPropKey.context,
              defaults.context.text,
              defaults.context.loc
            )
      )
    }
  }

  if (values) {
    properties.push(createValuesProperty(MsgDescriptorPropKey.values, values))
  }

  if (elements) {
    properties.push(
      createValuesProperty(MsgDescriptorPropKey.components, elements)
    )
  }

  return createMessageDescriptorObjectExpression(
    properties,
    // preserve line numbers for extractor
    oldLoc
  )
}

function createIdProperty(message: string, context?: string) {
  return createStringObjectProperty(
    MsgDescriptorPropKey.id,
    generateMessageId(message, context)
  )
}

function createValuesProperty(key: string, values: Record<string, Expression>) {
  const valuesObject = Object.keys(values).map((key) =>
    types.objectProperty(types.identifier(key), values[key])
  )

  if (!valuesObject.length) return

  return types.objectProperty(
    types.identifier(key),
    types.objectExpression(valuesObject)
  )
}

export function createStringObjectProperty(
  key: string,
  value: string,
  oldLoc?: SourceLocation
) {
  const property = types.objectProperty(
    types.identifier(key),
    types.stringLiteral(value)
  )
  if (oldLoc) {
    property.loc = oldLoc
  }

  return property
}

function getTextFromExpression(exp: Expression): string {
  if (types.isStringLiteral(exp)) {
    return exp.value
  }

  if (types.isTemplateLiteral(exp)) {
    if (exp?.quasis.length === 1) {
      return exp.quasis[0]?.value?.cooked
    }
  }
}

function createMessageDescriptorObjectExpression(
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
