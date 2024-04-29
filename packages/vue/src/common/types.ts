import {
  type CompoundExpressionNode,
  type DirectiveNode,
  type NodeTransform,
} from "@vue/compiler-core"

//

export type VtDirectiveNode = {
  exp: CompoundExpressionNode
} & DirectiveNode

export type Node = Parameters<NodeTransform>[0]
export const TAGS = {
  Trans: "Trans",
} as const
