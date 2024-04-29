import { generateMessageId } from "@lingui/message-utils/generateMessageId"

import { isElementNode, isVtDirectiveNode } from "./predicates"
import { type Node, type VtDirectiveNode } from "./types"

//

export function getVtDirectiveProps(node: Node): VtDirectiveNode[] {
  return isElementNode(node) ? node.props.filter(isVtDirectiveNode) : []
}

export function getContent(prop: VtDirectiveNode): string {
  const [, ...templateLiterals] = prop.exp.children
  let index = 0
  let inInterpolation = false
  // get raw as "`hello {0}, it is {1}!`"
  // from "`hello ${", {type: 4, content: "_ctx.where"}, "} it is ${", {type: 4, content: "_ctx.when"}, "}!`"
  const raw = templateLiterals.reduce<string>((previous, current) => {
    if (typeof current === "string") {
      if (inInterpolation && current.includes("}")) {
        inInterpolation = false
        current = current.replace(/([\s\S]*?)\}/u, "}")
      }
      if (!inInterpolation) {
        return previous + current.replace(/\$\{$/u, "{")
      }
    }

    // return index only once
    // wait for a switch back before returning index again
    if (!inInterpolation) {
      inInterpolation = true
      // values will be index based so we do not care about real name
      return previous + index++
    }

    // use case: still in interpolation but index already
    // returned previously
    return previous
  }, "")

  const matchTL = raw.match(/^`([\s\S.]*)`$/u)
  // if vt`hello world!`
  if (matchTL && matchTL[1]) {
    // string without ` `
    return matchTL[1].trim()
  } else {
    throw new Error(`unexpected content: ${raw}`)
  }
}

// TODO: add context / extract it
export function getId(content: string): string {
  return generateMessageId(content)
}
