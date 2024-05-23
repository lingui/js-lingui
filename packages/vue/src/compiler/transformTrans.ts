import {
  createSimpleExpression,
  type ElementNode,
  type TransformContext,
  NodeTypes,
  ConstantTypes,
  ElementTypes,
  SourceLocation,
} from "@vue/compiler-core"
import {
  createMacroTransVueContext,
  tokenizeTrans,
  getTemplateSlot,
  getTextProp,
  tokenizeChoiceElement,
} from "../common/Trans"
import {
  ICUMessageFormat,
  createMessageDescriptor,
  JsMacroName,
} from "@lingui/babel-plugin-lingui-macro/ast"
import generate from "@babel/generator"
import { ObjectExpression } from "@babel/types"

function transformElement(
  node: ElementNode,
  descriptor: ObjectExpression,
  loc: SourceLocation,
  elements?: Record<string, ElementNode> | undefined
) {
  const simpleExp = createSimpleExpression(
    generate(descriptor).code,
    false,
    loc,
    ConstantTypes.NOT_CONSTANT
  )

  node.props = [
    {
      type: NodeTypes.DIRECTIVE,
      name: "bind",
      exp: simpleExp,
      arg: undefined,
      modifiers: [],
      loc,
    },
  ]

  node.isSelfClosing = true

  if (elements) {
    node.children = Object.keys(elements).map((key) => {
      return getTemplateSlot(Number(key), elements[key]! as any)
    })
  } else {
    node.children = []
  }

  node.tagType = ElementTypes.COMPONENT
}

export function transformChoiceElement(
  node: ElementNode,
  transformContext: TransformContext
) {
  const loc = node.loc

  const tokens = tokenizeChoiceElement(
    node,
    createMacroTransVueContext(() => true, false)
  )

  const messageFormat = new ICUMessageFormat()
  const { message, values, elements } = messageFormat.fromTokens(tokens)

  const descriptor = createMessageDescriptor({ message, values }, loc, false)

  transformElement(node, descriptor, loc, elements)
}

export function transformTrans(
  node: ElementNode,
  transformContext: TransformContext
) {
  const loc = node.loc
  const tokens = tokenizeTrans(
    node,
    createMacroTransVueContext((identifier, macro) => {
      if (macro === JsMacroName.t) {
        return identifier.name === "vt"
      }

      return identifier.name === macro
    }, false)
  )

  const messageFormat = new ICUMessageFormat()
  const { message, values, elements } = messageFormat.fromTokens(tokens)

  const id = getTextProp(node, "id")
  const context = getTextProp(node, "context")
  const comment = getTextProp(node, "comment")

  const descriptor = createMessageDescriptor({ message, values }, loc, false, {
    ...(id
      ? {
          id: {
            text: id,
          },
        }
      : {}),
    ...(context
      ? {
          context: {
            text: context,
          },
        }
      : {}),
    ...(comment
      ? {
          comment: {
            text: comment,
          },
        }
      : {}),
  })

  transformElement(node, descriptor, loc, elements)
}
