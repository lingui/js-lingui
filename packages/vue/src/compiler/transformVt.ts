import {
  createSimpleExpression,
  SourceLocation,
  ConstantTypes,
  ExpressionNode,
} from "@vue/compiler-core"
import * as t from "@babel/types"
import generate from "@babel/generator"
import {
  JsMacroName,
  createMessageDescriptorFromTokens,
  isLinguiIdentifier,
  tokenizeTemplateLiteral,
  createMacroJsContext,
  isChoiceMethod,
  tokenizeChoiceComponent,
  processDescriptor,
  MacroJsContext,
} from "@lingui/babel-plugin-lingui-macro/ast"

const RUNTIME_VT_SYMBOL = "vt._"

function createLinguiSimpleExpression(
  messageDescriptor: t.ObjectExpression,
  oldLoc: SourceLocation
) {
  const ast = t.callExpression(t.identifier(RUNTIME_VT_SYMBOL), [
    messageDescriptor,
  ])

  return createSimpleExpression(
    generate(ast).code,
    false,
    oldLoc,
    ConstantTypes.NOT_CONSTANT
  )
}

function createVueMacroContext() {
  return createMacroJsContext((identifier, macro) => {
    if (macro === JsMacroName.t) {
      return identifier.name === "vt"
    }

    return identifier.name === macro
  }, false)
}

export function tokenizeAsChoiceComponentOrUndefined(
  node: t.Node,
  ctx: MacroJsContext
) {
  // plural / select / selectOrdinal
  if (t.isCallExpression(node) && isChoiceMethod(node, ctx)) {
    return [tokenizeChoiceComponent(node, isChoiceMethod(node, ctx)!, ctx)]
  }

  return
}

export function tokenizeAsLinguiTemplateLiteralOrUndefined(
  node: t.Node,
  ctx: MacroJsContext
) {
  // t`Hello!`
  if (
    t.isTaggedTemplateExpression(node) &&
    isLinguiIdentifier(node.tag, JsMacroName.t, ctx)
  ) {
    return tokenizeTemplateLiteral(node, ctx)
  }
  return
}

export function transformVt(
  vueNode: ExpressionNode,
  ctx = createVueMacroContext()
) {
  if (!vueNode.ast) {
    return vueNode
  }

  const node = vueNode.ast

  // plural / select / selectOrdinal
  const choiceCmpTokens = tokenizeAsChoiceComponentOrUndefined(node, ctx)

  if (choiceCmpTokens) {
    const messageDescriptor = createMessageDescriptorFromTokens(
      choiceCmpTokens,
      node.loc!,
      ctx.stripNonEssentialProps
    )

    return createLinguiSimpleExpression(messageDescriptor, vueNode.loc!)
  }

  //  t(...)
  if (
    t.isCallExpression(node) &&
    isLinguiIdentifier(node.callee, JsMacroName.t, ctx)
  ) {
    const messageDescriptor = processDescriptor(
      node.arguments[0] as t.ObjectExpression,
      ctx
    )

    return createLinguiSimpleExpression(messageDescriptor, vueNode.loc!)
  }

  // t`Hello!`
  const tplLiteralTokens = tokenizeAsLinguiTemplateLiteralOrUndefined(node, ctx)
  if (tplLiteralTokens) {
    const messageDescriptor = createMessageDescriptorFromTokens(
      tplLiteralTokens,
      node.loc!,
      ctx.stripNonEssentialProps
    )

    return createLinguiSimpleExpression(messageDescriptor, vueNode.loc!)
  }

  return vueNode
}
