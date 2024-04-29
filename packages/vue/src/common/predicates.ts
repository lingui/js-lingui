import {
  type AttributeNode,
  type Node as BaseNode,
  type CompoundExpressionNode,
  type DirectiveNode,
  type ElementNode,
  type InterpolationNode,
  type SimpleExpressionNode,
  type TextNode,
} from "@vue/compiler-core"

import { type Node, TAGS, type VtDirectiveNode } from "./types"

//

export function isBaseNode(node: unknown): node is BaseNode {
  return Boolean(node && typeof node === "object" && "type" in node)
}

export function isElementNode(node: unknown): node is ElementNode {
  return isBaseNode(node) && node.type === /* NodeTypes.ELEMENT */ 1
}

export function isTextNode(node: unknown): node is TextNode {
  return isBaseNode(node) && node.type === /* NodeTypes.TEXT */ 2
}

export function isSimpleExpressionNode(
  node: unknown
): node is SimpleExpressionNode {
  return isBaseNode(node) && node.type === /* NodeTypes.SIMPLE_EXPRESSION */ 4
}

export function isInterpolationNode(node: unknown): node is InterpolationNode {
  return isBaseNode(node) && node.type === /* NodeTypes.INTERPOLATION */ 5
}

export function isAttributeNode(node: unknown): node is AttributeNode {
  return isBaseNode(node) && node.type === /* NodeTypes.ATTRIBUTE */ 6
}

export function isDirectiveNode(
  node: BaseNode | undefined
): node is DirectiveNode {
  return node?.type === /* NodeTypes.DIRECTIVE */ 7
}

export function isCompoundExpressionNode(
  node: BaseNode | undefined
): node is CompoundExpressionNode {
  return node?.type === /* NodeTypes.COMPOUND_EXPRESSION */ 8
}

export function isVtDirectiveNode(
  prop: BaseNode | undefined
): prop is VtDirectiveNode {
  return Boolean(
    isDirectiveNode(prop) &&
      prop.exp &&
      isCompoundExpressionNode(prop.exp) &&
      // is this redondant with ast tests?
      isSimpleExpressionNode(prop.exp.children[0]) &&
      prop.exp.ast &&
      prop.exp.ast.type === "TaggedTemplateExpression" &&
      prop.exp.ast.tag.type === "Identifier" &&
      prop.exp.ast.tag.name === "_ctx.vt"
  )
}

export function isTrans(node: Node): node is ElementNode {
  return Boolean(
    node.type === /* NodeTypes.ELEMENT */ 1 &&
      node.tag === TAGS.Trans &&
      node.children?.length
  )
}
