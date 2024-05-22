import {
  createSimpleExpression,
  type ElementNode,
  type TransformContext,
  NodeTypes,
  ConstantTypes,
  ElementTypes,
} from "@vue/compiler-core"
import {
  createMacroTransVueContext,
  tokenizeTrans,
  getTemplateSlot,
  getTextProp,
} from "../common/Trans"
import {
  ICUMessageFormat,
  createMessageDescriptor,
} from "@lingui/babel-plugin-lingui-macro/ast"
import generate from "@babel/generator"

export function transformTrans(
  node: ElementNode,
  transformContext: TransformContext
) {
  const loc = node.loc
  const tokens = tokenizeTrans(
    node,
    createMacroTransVueContext(() => true, false)
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
