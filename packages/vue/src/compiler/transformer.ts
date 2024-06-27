import { type NodeTransform, NodeTypes } from "@vue/compiler-core"

import {
  isTrans,
  isElementNode,
  isDirectiveNode,
  isInterpolationNode,
} from "../common/predicates"
import { transformVt } from "./transformVt"
import { transformTrans } from "./transformTrans"

export type LinguiTransformerOptions = {
  stripNonEssentialProps?: boolean
}

/**
 * Here is an entry point transformer.
 * We need our template transformer to operate on user authored code
 * before any other Vue transformer process it.
 *
 * So this transformer unshifts a real transformer to the transformers array.
 *
 */
export const transformer =
  (options: LinguiTransformerOptions): NodeTransform =>
  (node, context) => {
    if (
      node.type === NodeTypes.ROOT &&
      !context.nodeTransforms.find(
        (t) => (t as any).__name === "linguiTransform"
      )
    ) {
      context.nodeTransforms.unshift(templateTransformer(options))
    }
  }

/**
 * Actual transformer expanding macro calls.
 */
const templateTransformer = (
  options: LinguiTransformerOptions
): NodeTransform => {
  const transformer: NodeTransform = (node) => {
    if (isElementNode(node)) {
      if (isTrans(node)) {
        transformTrans(node, options)
      }

      for (const prop of node.props) {
        if (isDirectiveNode(prop) && prop.exp) {
          prop.exp = transformVt(prop.exp, options)
        }
      }
    }

    if (isInterpolationNode(node)) {
      node.content = transformVt(node.content, options)
    }
  }

  ;(transformer as any).__name = "linguiTransform"
  return transformer
}
