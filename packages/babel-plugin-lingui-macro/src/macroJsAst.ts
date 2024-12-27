import * as t from "@babel/types"
import {
  CallExpression,
  Expression,
  Identifier,
  Node,
  ObjectExpression,
  ObjectProperty,
  StringLiteral,
  TemplateLiteral,
} from "@babel/types"
import { JsMacroName, MsgDescriptorPropKey } from "./constants"
import { ArgToken, TextToken, Token } from "./icu"
import { createMessageDescriptorFromTokens } from "./messageDescriptorUtils"
import { makeCounter } from "./utils"

export type MacroJsContext = {
  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  getExpressionIndex: () => number
  stripNonEssentialProps: boolean
  stripMessageProp: boolean
  isLinguiIdentifier: (node: Identifier, macro: JsMacroName) => boolean
}

export function createMacroJsContext(
  isLinguiIdentifier: MacroJsContext["isLinguiIdentifier"],
  stripNonEssentialProps: boolean,
  stripMessageProp: boolean
): MacroJsContext {
  return {
    getExpressionIndex: makeCounter(),
    isLinguiIdentifier,
    stripNonEssentialProps,
    stripMessageProp,
  }
}

/**
 * `processDescriptor` expand macros inside message descriptor.
 * Message descriptor is used in `defineMessage`.
 *
 * {
 *   comment: "Description",
 *   message: plural("value", { one: "book", other: "books" })
 * }
 *
 * ↓ ↓ ↓ ↓ ↓ ↓
 *
 * {
 *   comment: "Description",
 *   id: <hash>
 *   message: "{value, plural, one {book} other {books}}"
 * }
 *
 */
export function processDescriptor(
  descriptor: ObjectExpression,
  ctx: MacroJsContext
) {
  const messageProperty = getObjectPropertyByKey(
    descriptor,
    MsgDescriptorPropKey.message
  )
  const idProperty = getObjectPropertyByKey(descriptor, MsgDescriptorPropKey.id)
  const contextProperty = getObjectPropertyByKey(
    descriptor,
    MsgDescriptorPropKey.context
  )
  const commentProperty = getObjectPropertyByKey(
    descriptor,
    MsgDescriptorPropKey.comment
  )

  let tokens: Token[] = []

  // if there's `message` property, replace macros with formatted message
  if (messageProperty) {
    // Inside message descriptor the `t` macro in `message` prop is optional.
    // Template strings are always processed as if they were wrapped by `t`.
    const messageValue = messageProperty.value

    tokens = t.isTemplateLiteral(messageValue)
      ? tokenizeTemplateLiteral(messageValue, ctx)
      : tokenizeNode(messageValue, true, ctx)
  }

  return createMessageDescriptorFromTokens(
    tokens,
    descriptor.loc,
    ctx.stripNonEssentialProps,
    ctx.stripMessageProp,
    {
      id: idProperty,
      context: contextProperty,
      comment: commentProperty,
    }
  )
}

export function tokenizeNode(
  node: Node,
  ignoreExpression = false,
  ctx: MacroJsContext
): Token[] {
  if (isI18nMethod(node, ctx)) {
    // t
    return tokenizeTemplateLiteral(node as Expression, ctx)
  }

  if (t.isCallExpression(node) && isArgDecorator(node, ctx)) {
    return [tokenizeArg(node, ctx)]
  }

  const choiceMethod = isChoiceMethod(node, ctx)
  // plural, select and selectOrdinal
  if (choiceMethod) {
    return [tokenizeChoiceComponent(node as CallExpression, choiceMethod, ctx)]
  }

  if (t.isStringLiteral(node)) {
    return [
      {
        type: "text",
        value: node.value,
      } satisfies TextToken,
    ]
  }
  //   if (isFormatMethod(node.callee)) {
  //   // date, number
  //   return transformFormatMethod(node, file, props, root)

  if (!ignoreExpression) {
    return [tokenizeExpression(node, ctx)]
  }
}

/**
 * `node` is a TemplateLiteral. node.quasi contains
 * text chunks and node.expressions contains expressions.
 * Both arrays must be zipped together to get the final list of tokens.
 */
export function tokenizeTemplateLiteral(
  node: Expression,
  ctx: MacroJsContext
): Token[] {
  const tpl = t.isTaggedTemplateExpression(node)
    ? node.quasi
    : (node as TemplateLiteral)

  const expressions = tpl.expressions as Expression[]

  return tpl.quasis.flatMap((text, i) => {
    const value = text.value.cooked

    let argTokens: Token[] = []
    const currExp = expressions[i]

    if (currExp) {
      argTokens = t.isCallExpression(currExp)
        ? tokenizeNode(currExp, false, ctx)
        : [tokenizeExpression(currExp, ctx)]
    }
    const textToken: TextToken = {
      type: "text",
      value,
    }
    return [...(value ? [textToken] : []), ...argTokens]
  })
}

export function tokenizeChoiceComponent(
  node: CallExpression,
  componentName: string,
  ctx: MacroJsContext
): ArgToken {
  const format = componentName.toLowerCase()

  const token: ArgToken = {
    ...tokenizeExpression(node.arguments[0], ctx),
    format: format,
    options: {
      offset: undefined,
    },
  }

  const props = (node.arguments[1] as ObjectExpression).properties

  for (const attr of props) {
    if (!t.isObjectProperty(attr)) {
      throw new Error("Expected an ObjectProperty")
    }

    const key = attr.key
    const attrValue = attr.value as Expression

    // name is either:
    // NumericLiteral => convert to `={number}`
    // StringLiteral => key.value
    // Identifier => key.name
    const name = t.isNumericLiteral(key)
      ? `=${key.value}`
      : (key as Identifier).name || (key as StringLiteral).value

    if (format !== "select" && name === "offset") {
      token.options.offset = (attrValue as StringLiteral).value
    } else {
      let value: ArgToken["options"][string]

      if (t.isTemplateLiteral(attrValue)) {
        value = tokenizeTemplateLiteral(attrValue, ctx)
      } else if (t.isCallExpression(attrValue)) {
        value = tokenizeNode(attrValue, false, ctx)
      } else if (t.isStringLiteral(attrValue)) {
        value = attrValue.value
      } else if (t.isExpression(attrValue)) {
        value = tokenizeExpression(attrValue, ctx)
      } else {
        value = (attrValue as unknown as StringLiteral).value
      }
      token.options[name] = value
    }
  }

  return token
}

function tokenizeLabeledExpression(
  node: ObjectExpression,
  ctx: MacroJsContext
): ArgToken {
  if (node.properties.length > 1) {
    throw new Error(
      "Incorrect usage, expected exactly one property as `{variableName: variableValue}`"
    )
  }

  // assume this is labeled expression, {label: value}
  const property = node.properties[0]

  if (t.isProperty(property) && t.isIdentifier(property.key)) {
    return {
      type: "arg",
      name: expressionToArgument(property.key, ctx),
      value: property.value as Expression,
    }
  } else {
    throw new Error(
      "Incorrect usage of a labeled expression. Expected to have one object property with property key as identifier"
    )
  }
}

export function tokenizeExpression(
  node: Node | Expression,
  ctx: MacroJsContext
): ArgToken {
  if (t.isTSAsExpression(node)) {
    return tokenizeExpression(node.expression, ctx)
  }
  if (t.isObjectExpression(node)) {
    return tokenizeLabeledExpression(node, ctx)
  } else if (
    t.isCallExpression(node) &&
    isLinguiIdentifier(node.callee, JsMacroName.ph, ctx) &&
    node.arguments.length > 0
  ) {
    if (!t.isObjectExpression(node.arguments[0])) {
      throw new Error(
        "Incorrect usage of `ph` macro. First argument should be an ObjectExpression"
      )
    }

    return tokenizeLabeledExpression(node.arguments[0], ctx)
  }

  return {
    type: "arg",
    name: expressionToArgument(node as Expression, ctx),
    value: node as Expression,
  }
}

export function tokenizeArg(
  node: CallExpression,
  ctx: MacroJsContext
): ArgToken {
  const arg = node.arguments[0] as Expression

  return {
    type: "arg",
    name: expressionToArgument(arg, ctx),
    raw: true,
    value: arg,
  }
}

export function expressionToArgument(
  exp: Expression,
  ctx: MacroJsContext
): string {
  if (t.isIdentifier(exp)) {
    return exp.name
  }
  return String(ctx.getExpressionIndex())
}

export function isArgDecorator(node: Node, ctx: MacroJsContext): boolean {
  return (
    t.isCallExpression(node) &&
    isLinguiIdentifier(node.callee, JsMacroName.arg, ctx)
  )
}

export function isDefineMessage(node: Node, ctx: MacroJsContext): boolean {
  return (
    isLinguiIdentifier(node, JsMacroName.defineMessage, ctx) ||
    isLinguiIdentifier(node, JsMacroName.msg, ctx)
  )
}

export function isI18nMethod(node: Node, ctx: MacroJsContext) {
  if (!t.isTaggedTemplateExpression(node)) {
    return
  }

  const tag = node.tag

  return (
    isLinguiIdentifier(tag, JsMacroName.t, ctx) ||
    (t.isCallExpression(tag) &&
      isLinguiIdentifier(tag.callee, JsMacroName.t, ctx))
  )
}

export function isLinguiIdentifier(
  node: Node,
  name: JsMacroName,
  ctx: MacroJsContext
) {
  if (!t.isIdentifier(node)) {
    return false
  }

  return ctx.isLinguiIdentifier(node, name)
}

export function isChoiceMethod(node: Node, ctx: MacroJsContext) {
  if (!t.isCallExpression(node)) {
    return
  }

  if (isLinguiIdentifier(node.callee, JsMacroName.plural, ctx)) {
    return JsMacroName.plural
  }
  if (isLinguiIdentifier(node.callee, JsMacroName.select, ctx)) {
    return JsMacroName.select
  }
  if (isLinguiIdentifier(node.callee, JsMacroName.selectOrdinal, ctx)) {
    return JsMacroName.selectOrdinal
  }
}

function getObjectPropertyByKey(
  objectExp: ObjectExpression,
  key: string
): ObjectProperty {
  return objectExp.properties.find(
    (property) =>
      t.isObjectProperty(property) &&
      t.isIdentifier(property.key as Expression, {
        name: key,
      })
  ) as ObjectProperty
}
