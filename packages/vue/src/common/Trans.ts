import {
  type ElementNode,
  findProp,
  TemplateChildNode,
  SimpleExpressionNode,
} from "@vue/compiler-core"

import {
  isAttributeNode,
  isElementNode,
  isInterpolationNode,
  isSimpleExpressionNode,
  isTextNode,
} from "./predicates"
import {
  TextToken,
  Token,
  JsMacroName,
  ElementToken,
  ArgToken,
  isArgDecorator,
  tokenizeArg,
  MacroJsContext,
} from "@lingui/babel-plugin-lingui-macro/ast"
import * as t from "@babel/types"
import {
  tokenizeAsChoiceComponentOrUndefined,
  tokenizeAsLinguiTemplateLiteralOrUndefined,
} from "../compiler/transformVt"

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

function tokenizeText(value: string): TextToken {
  return {
    type: "text",
    value,
  }
}

/**
 * Receive a Vue element which is none of the Lingui macro, and returns Tokens for
 * element itself and all of it's children
 *
 * ```
 * <Trans>Hello <strong>world!</strong></Trans>
 *              |---------------------|
 * ```
 */
function tokenizeElementNode(
  node: ElementNode,
  ctx: MacroTransVueContext
): ElementToken {
  // !!! Important: Calculate element index before traversing children.
  // That way outside elements are numbered before inner elements. (...and it looks pretty).
  const name = ctx.getElementIndex()

  return {
    type: "element",
    name,
    value: node,
    children: node.children
      .flatMap((child) => tokenizeChildren(child, ctx))
      .filter(Boolean) as Token[],
  }
}

/**
 * Take `<Trans>Hello <strong>{{name}}</strong></Trans>` and returns Tokens
 */
export function tokenizeTrans(node: ElementNode, ctx: MacroTransVueContext) {
  return node.children
    .flatMap((child) => tokenizeChildren(child, ctx))
    .filter(Boolean) as Token[]
}

/**
 * Process children of Elements and returns Tokens
 */
function tokenizeChildren(
  node: TemplateChildNode,
  ctx: MacroTransVueContext
): Token[] {
  // <Trans>Hello <strong>Username</strong></Trans>
  //       |-----|
  if (isTextNode(node)) {
    return [tokenizeText(node.content)]
  }

  // <Trans>Hello <strong>Username</strong></Trans>
  //             |------------------------|
  // goes into recursion for inner Element Nodes
  if (isElementNode(node)) {
    return [tokenizeElementNode(node, ctx)]
  }

  // <Trans>Hello {{ username }}</Trans>
  //             |-------------|
  if (isInterpolationNode(node) && isSimpleExpressionNode(node.content)) {
    return tokenizeSimpleExpressionNode(node.content, ctx)
  }

  return []
}

/**
 * Take an expression from Vue interpolation and returns Tokens
 *
 * ```
 * <Trans>Hello {{ username }}</Trans>
 *              |------------|
 * ```
 *
 * Supported expressions:
 *
 * - {{ username }} -> {username}
 * - {{ user.name }} -> {0}
 * - {{ plural(...) }} | {{ select(...) }} -> {count, plural, one {...} other {...}}
 * - {{ arg(username) }} -> username
 */
function tokenizeSimpleExpressionNode(
  node: SimpleExpressionNode,
  ctx: MacroTransVueContext
): Token[] {
  if (node.ast) {
    const vtTokens = tokenizeVt(node.ast, ctx)

    if (vtTokens) {
      return vtTokens
    }

    if (t.isCallExpression(node.ast) && isArgDecorator(node.ast, ctx)) {
      return [tokenizeArg(node.ast, ctx)]
    }

    return [
      {
        type: "arg",
        name: String(ctx.getExpressionIndex()),
        value: node.ast as t.Expression,
      } satisfies ArgToken,
    ]
  }

  // For simple interpolation with identifier
  // only Vue doesn't populate an `.ast`
  return [
    {
      type: "arg",
      name: node.content,
      value: t.identifier(node.content),
    } satisfies ArgToken,
  ]
}

function tokenizeVt(node: t.Node, ctx: MacroJsContext) {
  for (const fn of [
    tokenizeAsChoiceComponentOrUndefined,
    tokenizeAsLinguiTemplateLiteralOrUndefined,
  ]) {
    const tokens = fn(node, ctx)

    if (tokens) {
      return tokens
    }
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
