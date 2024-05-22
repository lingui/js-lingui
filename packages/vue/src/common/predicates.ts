import {
  type AttributeNode,
  type Node as BaseNode,
  type DirectiveNode,
  type ElementNode,
  type InterpolationNode,
  type SimpleExpressionNode,
  type TextNode,
  NodeTypes,
} from "@vue/compiler-core"

import { type Node, TAGS } from "./types"

//
export function isBaseNode(node: unknown): node is BaseNode {
  return Boolean(node && typeof node === "object" && "type" in node)
}

export function isElementNode(node: unknown): node is ElementNode {
  return isBaseNode(node) && node.type === NodeTypes.ELEMENT
}

export function isTextNode(node: unknown): node is TextNode {
  return isBaseNode(node) && node.type === NodeTypes.TEXT
}

export function isSimpleExpressionNode(
  node: unknown
): node is SimpleExpressionNode {
  return isBaseNode(node) && node.type === NodeTypes.SIMPLE_EXPRESSION
}

export function isInterpolationNode(node: unknown): node is InterpolationNode {
  return isBaseNode(node) && node.type === NodeTypes.INTERPOLATION
}

export function isAttributeNode(node: unknown): node is AttributeNode {
  return isBaseNode(node) && node.type === NodeTypes.ATTRIBUTE
}

export function isDirectiveNode(
  node: BaseNode | undefined
): node is DirectiveNode {
  return node?.type === NodeTypes.DIRECTIVE
}

export function isTrans(node: Node): boolean {
  return Boolean(
    isElementNode(node) && node.tag === TAGS.Trans && node.children?.length
  )
}
