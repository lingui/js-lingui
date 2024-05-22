import {
  createSimpleExpression,
  type ElementNode,
  findProp,
  type TemplateNode,
  NodeTypes,
  ElementTypes,
  TemplateChildNode,
} from "@vue/compiler-core"

import {
  isAttributeNode,
  isElementNode,
  isInterpolationNode,
  isSimpleExpressionNode,
  isTextNode,
} from "./predicates"
import {
  TextToken,
  Token,
  JsMacroName,
  ElementToken,
  ArgToken,
} from "@lingui/babel-plugin-lingui-macro/ast"
import * as t from "@babel/types"
import { Identifier } from "@babel/types"

export const makeCounter =
  (index = 0) =>
  () =>
    index++

//

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

export function getTemplateSlot(index: number, node: ElementNode) {
  return wrapInTemplateSlotNode(index, createInnerSlotNode(node))
}

const tokenizeText = (value: string): TextToken => {
  return {
    type: "text",
    value,
  }
}

export const tokenizeElement = (
  node: ElementNode,
  ctx: MacroTransVueContext
): ElementToken => {
  // !!! Important: Calculate element index before traversing children.
  // That way outside elements are numbered before inner elements. (...and it looks pretty).
  const name = ctx.getElementIndex()

  return {
    type: "element",
    name,
    value: node as any,
    children: node.children
      .map((child) => tokenizeChildren(child, ctx))
      .filter(Boolean) as Token[],
  }
}

export const tokenizeTrans = (node: ElementNode, ctx: MacroTransVueContext) => {
  return node.children
    .map((child) => tokenizeChildren(child, ctx))
    .filter(Boolean) as Token[]
}

export type MacroTransVueContext = {
  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  getExpressionIndex: () => number
  getElementIndex: () => number
  stripNonEssentialProps: boolean
  isLinguiIdentifier: (node: Identifier, macro: JsMacroName) => boolean
}

export function createMacroTransVueContext(
  isLinguiIdentifier: MacroTransVueContext["isLinguiIdentifier"],
  stripNonEssentialProps: boolean
): MacroTransVueContext {
  return {
    getExpressionIndex: makeCounter(),
    getElementIndex: makeCounter(),
    isLinguiIdentifier,
    stripNonEssentialProps,
  }
}

function tokenizeChildren(
  node: TemplateChildNode,
  ctx: MacroTransVueContext
): Token | undefined {
  if (isTextNode(node)) {
    return tokenizeText(node.content)
  }

  if (isElementNode(node)) {
    return tokenizeElement(node, ctx)
  }

  if (isInterpolationNode(node) && isSimpleExpressionNode(node.content)) {
    // simple interpolation with identifier only
    if (!node.content.ast) {
      return {
        type: "arg",
        name: node.content.content,
        value: t.identifier(node.content.content),
      } as ArgToken
    }

    return {
      type: "arg",
      name: String(ctx.getExpressionIndex()),
      value: node.content.ast,
    } as ArgToken
  }

  return undefined
}

export function getTextProp(
  node: ElementNode,
  propName: string
): string | undefined {
  const prop = findProp(node, propName, undefined, false)
  if (isAttributeNode(prop) && prop.value?.content) {
    return prop.value.content
  }
  return undefined
}
