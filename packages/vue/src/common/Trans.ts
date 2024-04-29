import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import {
  createSimpleExpression,
  type ElementNode,
  findProp,
  type TemplateNode,
} from "@vue/compiler-core"

import {
  isAttributeNode,
  isElementNode,
  isInterpolationNode,
  isSimpleExpressionNode,
  isTextNode,
} from "./predicates"

//

function wrapInTemplateSlotNode(
  index: number,
  child: ElementNode
): TemplateNode {
  const loc = child.loc
  return {
    type: /* NodeTypes.ELEMENT */ 1,
    ns: 0,
    tag: "template",
    tagType: /* ElementTypes.TEMPLATE */ 3,
    props: [
      {
        type: /* NodeTypes.DIRECTIVE */ 7,
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

function createInnerSlotNode(sourceChild: ElementNode): ElementNode {
  if (sourceChild.isSelfClosing) return sourceChild
  const loc = sourceChild.loc
  // no need for a deep copy
  return {
    ...sourceChild,
    children: [
      {
        type: /* NodeTypes.ELEMENT */ 1,
        ns: 0,
        tag: "component",
        tagType: /* ElementTypes.COMPONENT */ 1,
        props: [
          {
            type: /* NodeTypes.DIRECTIVE */ 7,
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

function getTemplateSlot(index: number, node: ElementNode) {
  return wrapInTemplateSlotNode(index, createInnerSlotNode(node))
}

const valuesIndex = Symbol("index")

export function getContent(
  node: ElementNode,
  {
    onlyContent = false,
    content = "",
    templateSlots = [],
    values = {
      [valuesIndex]: 0,
    },
  }: {
    // optimize when some parts are not needed when only content matters
    onlyContent?: boolean
    content?: string
    templateSlots?: ElementNode[]
    values?: Record<string, string> & { [valuesIndex]: number }
  } = {}
) {
  const newContent: string = node.children
    .reduce((previousContent: string, child) => {
      if (isTextNode(child)) {
        return previousContent + child.content
      } else if (isElementNode(child)) {
        const index = templateSlots.length
        if (onlyContent) {
          templateSlots.length++
        } else {
          templateSlots[index] = getTemplateSlot(index, child)
        }
        if (child.isSelfClosing) {
          return `${previousContent}<${index}/>`
        } else {
          return `${previousContent}<${index}>${
            getContent(child, { onlyContent, templateSlots, values }).content
          }</${index}>`
        }
      } else if (
        isInterpolationNode(child) &&
        isSimpleExpressionNode(child.content)
      ) {
        let value: string | number = ""

        // simple interpolation without member expression
        if (!child.content.ast) {
          value = child.content.content
          values[value] = value
        } else {
          value = values[valuesIndex]
          values[value] = child.content.content
          values[valuesIndex]++
        }

        return `${previousContent}{${value}}`
      } else {
        return previousContent
      }
    }, content)
    .trim()

  return {
    content: newContent,
    templateSlots,
    values,
  }
}

export function getContext(node: ElementNode): string | undefined {
  const contextProp = findProp(node, "context", undefined, false)
  // be strict about non empty string versus undefined
  if (isAttributeNode(contextProp) && contextProp.value?.content) {
    return contextProp.value.content
  }
  return undefined
}

export function getId(node: ElementNode, content: string): string {
  const idProp = findProp(node, "id", undefined, false)
  // with findProp allowEmpty set to false this check is redondant
  // but it is for typing
  if (isAttributeNode(idProp) && idProp.value?.content) {
    return idProp.value.content
  } else {
    return generateMessageId(content, getContext(node))
  }
}
