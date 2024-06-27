import {
  createSimpleExpression,
  type ElementNode,
  type TransformContext,
  NodeTypes,
  ConstantTypes,
  ElementTypes,
  SourceLocation,
  type TemplateNode,
} from "@vue/compiler-core"
import {
  createMacroTransVueContext,
  tokenizeTrans,
  getTextProp,
} from "../common/Trans"
import {
  ICUMessageFormat,
  createMessageDescriptor,
  JsMacroName,
} from "@lingui/babel-plugin-lingui-macro/ast"
import generate from "@babel/generator"
import { ObjectExpression } from "@babel/types"

function wrapInTemplateSlotNode(
  index: number,
  child: ElementNode
): TemplateNode {
  const loc = child.loc
  return {
    type: NodeTypes.ELEMENT,
    ns: 0,
    tag: "template",
    tagType: ElementTypes.TEMPLATE,
    props: [
      {
        type: NodeTypes.DIRECTIVE,
        name: "slot",
        exp: createSimpleExpression("{children}", false, loc, 0),
        arg: createSimpleExpression(String(index), false, loc, 3),
        modifiers: [],
        loc,
      },
    ],
    isSelfClosing: false,
    children: [child],
    codegenNode: undefined,
    loc,
  }
}

export function createInnerSlotNode(sourceChild: ElementNode): ElementNode {
  if (sourceChild.isSelfClosing) return sourceChild
  const loc = sourceChild.loc
  // no need for a deep copy
  return {
    ...sourceChild,
    children: [
      {
        type: NodeTypes.ELEMENT,
        ns: 0,
        tag: "component",
        tagType: ElementTypes.COMPONENT,
        props: [
          {
            type: NodeTypes.DIRECTIVE,
            name: "bind",
            exp: createSimpleExpression("children", false, loc, 0),
            arg: createSimpleExpression("is", true, loc, 3),
            modifiers: [],
            loc,
          },
        ],
        isSelfClosing: false,
        children: [],
        loc,
        codegenNode: undefined,
      },
    ],
  }
}

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
      return wrapInTemplateSlotNode(
        Number(key),
        createInnerSlotNode(elements[key]! as any)
      )
    })
  } else {
    node.children = []
  }

  node.tagType = ElementTypes.COMPONENT
}

// from SFC to Babel
function convertLoc(
  loc: SourceLocation
): Parameters<typeof createMessageDescriptor>[1] {
  return {
    start: { ...loc.start, index: loc.start.offset },
    end: { ...loc.end, index: loc.end.offset },
    filename: loc.source,
    identifierName: null,
  }
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

  const descriptor = createMessageDescriptor(
    { message, values },
    convertLoc(loc),
    false,
    {
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
    }
  )

  transformElement(node, descriptor, loc, elements)
}
