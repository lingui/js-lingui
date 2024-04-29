import {
  createSimpleExpression,
  processExpression,
  type DirectiveNode,
  type ElementNode,
  type NodeTransform,
  type SourceLocation,
  type TransformContext,
} from "@vue/compiler-core"

import { isTrans } from "../common/predicates"
import { getContent, getContext, getId } from "../common/Trans"

//

// build the prop AST for :values="{foo: bar, ...}" passing to Trans components
// the contextual values used in the message
function buildValuesDirective(
  values: Record<string, string>,
  loc: SourceLocation,
  context: TransformContext
): DirectiveNode {
  if (!Object.keys(values).length) throw new Error("values is empty")
  // manually build :values source that would have been written
  let source = "{"
  source += Object.entries(values)
    .map(([key, content]) => `${key}: (${content})`)
    .join(", ")
  source += "}"
  // create & process the expression
  const exp = processExpression(
    createSimpleExpression(source, false, loc, 0),
    context
  )
  // return the :values directive
  return {
    type: /* DIRECTIVE */ 7,
    name: "bind",
    rawName: ":values",
    exp,
    arg: createSimpleExpression("values", true, loc, 3),
    modifiers: [],
    loc,
  }
}

export function transformTrans(
  node: ElementNode,
  transformContext: TransformContext
) {
  const loc = node.loc
  const { content, values, templateSlots } = getContent(node)
  const props: ElementNode["props"] = [
    {
      type: /* ATTRIBUTE */ 6,
      name: "id",
      value: { content: getId(node, content), type: 2, loc },
      nameLoc: loc,
      loc: loc,
    },
    {
      type: /* ATTRIBUTE */ 6,
      name: "message",
      value: { content, type: 2, loc },
      nameLoc: loc,
      loc,
    },
  ]
  if (Object.keys(values).length) {
    props.push(buildValuesDirective(values, loc, transformContext))
  }
  const context = getContext(node)
  if (context) {
    props.push({
      type: 6,
      name: "context",
      value: { content: context, type: 2, loc },
      nameLoc: loc,
      loc,
    })
  }
  node.props = props
  node.isSelfClosing = true
  node.children = [...templateSlots]
  node.tagType = 1
}

export const transformer: NodeTransform = (node, context) => {
  if (isTrans(node)) {
    transformTrans(node, context)
  }
}
