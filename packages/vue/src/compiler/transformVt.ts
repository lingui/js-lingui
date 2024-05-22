import {
  DirectiveNode,
  createSimpleExpression,
  SourceLocation,
  ConstantTypes,
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

export function transformVt(vueNode: DirectiveNode) {
  if (!(vueNode.exp && vueNode.exp.ast)) {
    return
  }

  const node = vueNode.exp.ast
  const ctx = createVueMacroContext()

  // plural / select / selectOrdinal
  if (t.isCallExpression(node) && isChoiceMethod(node, ctx)) {
    const tokens = tokenizeChoiceComponent(
      node,
      isChoiceMethod(node, ctx)!,
      ctx
    )

    const messageDescriptor = createMessageDescriptorFromTokens(
      tokens,
      node.loc!,
      ctx.stripNonEssentialProps
    )

    vueNode.exp = createLinguiSimpleExpression(messageDescriptor, vueNode.loc!)
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

    vueNode.exp = createLinguiSimpleExpression(messageDescriptor, vueNode.loc!)
  }

  // t`Hello!`
  if (
    t.isTaggedTemplateExpression(node) &&
    isLinguiIdentifier(node.tag, JsMacroName.t, ctx)
  ) {
    const tokens = tokenizeTemplateLiteral(node, ctx)

    const messageDescriptor = createMessageDescriptorFromTokens(
      tokens,
      node.loc!,
      ctx.stripNonEssentialProps
    )

    vueNode.exp = createLinguiSimpleExpression(messageDescriptor, vueNode.loc!)
  }
}
