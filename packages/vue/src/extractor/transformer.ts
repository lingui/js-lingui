import { type ElementNode, type NodeTransform } from "@vue/compiler-core"

import { isElementNode, isTrans } from "../common/predicates"
import { getContent, getContext, getId } from "../common/Trans"
import {
  getContent as getVtContent,
  getVtDirectiveProps,
  getId as getVtId,
} from "../common/vt"
import { type VtDirectiveNode } from "../common/types"

//

// This type slightly differs from what lingui extractor expects.
// It has different origin property.
// It will be transformed to what lingui wants on the parent level.
type ExtractedMessage = {
  id: string
  message: string
  context?: string
  origin: {
    line: number
    column?: number
  }
  comment?: string
}
type OnMessageExtracted = (msg: ExtractedMessage) => void

function getTransContent(node: ElementNode) {
  const { content } = getContent(node, { onlyContent: true })
  return content
}

export function visitTrans(
  node: ElementNode,
  onMessageExtracted: OnMessageExtracted
) {
  const { line, column } = node.loc.start
  const content = getTransContent(node)
  const id = getId(node, content)
  const context = getContext(node)
  onMessageExtracted({
    id,
    message: content,
    context,
    origin: { line, column },
  })
}

export function visitVt(
  node: VtDirectiveNode,
  onMessageExtracted: OnMessageExtracted
) {
  const { line, column } = node.exp.loc.start
  const content = getVtContent(node)
  const id = getVtId(content)
  onMessageExtracted({
    id,
    message: content,
    // context,
    origin: { line, column },
  })
}

export function createTransformer(
  onMessageExtracted: (msg: ExtractedMessage) => void
): NodeTransform {
  const transformer: NodeTransform = (node) => {
    if (!isElementNode(node)) return

    if (isTrans(node)) {
      visitTrans(node, onMessageExtracted)
    } else {
      const props = getVtDirectiveProps(node)
      for (const prop of props) {
        visitVt(prop, onMessageExtracted)
      }
    }
  }

  return transformer
}
