import {
  createSimpleExpression,
  type ElementNode,
  findProp,
  type TemplateNode,
  NodeTypes,
  ElementTypes,
  TemplateChildNode,
  SimpleExpressionNode,
} from "@vue/compiler-core"

import {
  isAttributeNode,
  isElementNode,
  isInterpolationNode,
  isSimpleExpressionNode,
  isTextNode,
  isDirectiveNode,
} from "./predicates"
import {
  TextToken,
  Token,
  JsMacroName,
  ElementToken,
  ArgToken,
} from "@lingui/babel-plugin-lingui-macro/ast"
import * as t from "@babel/types"
import { tokenizeVt } from "../compiler/transformVt"

export enum ElementMacroName {
  Trans = "Trans",
  Plural = "Plural",
  Select = "Select",
  SelectOrdinal = "SelectOrdinal",
}

export const makeCounter =
  (index = 0) =>
  () =>
    index++

export type MacroTransVueContext = {
  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  getExpressionIndex: () => number
  getElementIndex: () => number
  stripNonEssentialProps: boolean
  isLinguiIdentifier: (node: t.Identifier, macro: JsMacroName) => boolean
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

function tokenizeText(value: string): TextToken {
  return {
    type: "text",
    value,
  }
}

const tokenizeElementNode = (node: ElementNode, ctx: MacroTransVueContext) => {
  if (isChoiceElement(node)) {
    return tokenizeChoiceElement(node, ctx)
  }
  return tokenizeNonLinguiElement(node, ctx)
}

function tokenizeNonLinguiElement(
  node: ElementNode,
  ctx: MacroTransVueContext
): ElementToken {
  // !!! Important: Calculate element index before traversing children.
  // That way outside elements are numbered before inner elements. (...and it looks pretty).
  const name = ctx.getElementIndex()

  return {
    type: "element",
    name,
    value: node as any,
    children: node.children
      .flatMap((child) => tokenizeChildren(child, ctx))
      .filter(Boolean) as Token[],
  }
}

export function tokenizeTrans(node: ElementNode, ctx: MacroTransVueContext) {
  return node.children
    .flatMap((child) => tokenizeChildren(child, ctx))
    .filter(Boolean) as Token[]
}

function tokenizeChildren(
  node: TemplateChildNode,
  ctx: MacroTransVueContext
): Token[] {
  if (isTextNode(node)) {
    return [tokenizeText(node.content)]
  }

  if (isElementNode(node)) {
    return [tokenizeElementNode(node, ctx)]
  }

  if (isInterpolationNode(node) && isSimpleExpressionNode(node.content)) {
    if (node.content.ast) {
      const vtTokens = tokenizeVt(node.content.ast, ctx)

      if (vtTokens) {
        return vtTokens
      }
    }

    return [expressionToArgument(node.content, ctx)]
  }

  return []
}

function expressionToArgument(
  node: SimpleExpressionNode,
  ctx: MacroTransVueContext
) {
  // simple interpolation with identifier only
  if (!node.ast) {
    return {
      type: "arg",
      name: node.content,
      value: t.identifier(node.content),
    } as ArgToken
  }

  return {
    type: "arg",
    name: String(ctx.getExpressionIndex()),
    value: node.ast,
  } as ArgToken
}

const pluralRuleRe = /(_[\d\w]+|zero|one|two|few|many|other)/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

export function tokenizeChoiceElement(
  node: ElementNode,
  ctx: MacroTransVueContext
): Token {
  const format = getChoiceElementType(node)!.toLowerCase()

  const token: ArgToken = {
    type: "arg",
    format,
    name: null!,
    value: undefined!,
    options: {
      offset: undefined!,
    },
  }

  const valueProp = findProp(node, "value", undefined, false)

  if (isDirectiveNode(valueProp) && isSimpleExpressionNode(valueProp.exp)) {
    const { name, value } = expressionToArgument(valueProp.exp, ctx)
    token.name = name
    token.value = value
  } else {
    // todo: rise an error, incorrect usage of Trans
  }

  for (const prop of node.props) {
    let option: ArgToken["options"][number]

    if (isAttributeNode(prop)) {
      option = prop.value!.content
    } else {
      // todo DirectiveNode
      // todo rise an error if a binding used
      // if (prop.exp?.ast) {
      //
      // } else if (isSimpleExpressionNode(prop.exp)) {
      //   option = t.identifier(prop.exp.content)
      // }
    }

    if (pluralRuleRe.test(prop.name)) {
      token.options![jsx2icuExactChoice(prop.name)] = option
    } else {
      token.options![prop.name] = option
    }
  }

  return token
}

export function isChoiceElement(node: ElementNode): boolean {
  return Boolean(getChoiceElementType(node))
}

export function getChoiceElementType(
  node: ElementNode
): ElementMacroName | undefined {
  if (node.tag === ElementMacroName.Plural) {
    return ElementMacroName.Plural
  }
  if (node.tag === ElementMacroName.Select) {
    return ElementMacroName.Select
  }
  if (node.tag === ElementMacroName.SelectOrdinal) {
    return ElementMacroName.SelectOrdinal
  }

  return
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
