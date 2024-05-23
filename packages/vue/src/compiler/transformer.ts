import { type NodeTransform, NodeTypes } from "@vue/compiler-core"

import {
  isTrans,
  isElementNode,
  isDirectiveNode,
  isInterpolationNode,
} from "../common/predicates"
import { transformVt } from "./transformVt"
import { transformTrans, transformChoiceElement } from "./transformTrans"
import { isChoiceElement } from "../common/Trans"

/**
 * Here is an entry point transformer.
 * We need our template transformer to operate on user authored code
 * before any other Vue transformer process it.
 *
 * So this transformer unshifts a real transformer to the transformers array.
 *
 */
export const transformer: NodeTransform = (node, context) => {
  if (
    node.type === NodeTypes.ROOT &&
    !context.nodeTransforms.includes(templateTransformer)
  ) {
    context.nodeTransforms.unshift(templateTransformer)
  }
}

/**
 * Actual transformer expanding macro calls.
 */
const templateTransformer: NodeTransform = (node, context) => {
  if (isElementNode(node)) {
    if (isChoiceElement(node)) {
      transformChoiceElement(node, context)
    }

    if (isTrans(node)) {
      transformTrans(node, context)
    }

    for (const prop of node.props) {
      if (isDirectiveNode(prop) && prop.exp) {
        prop.exp = transformVt(prop.exp)
      }
    }
  }

  if (isInterpolationNode(node)) {
    node.content = transformVt(node.content)
  }
}
