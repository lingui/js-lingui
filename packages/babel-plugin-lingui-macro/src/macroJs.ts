import * as babelTypes from "@babel/types"
import * as t from "@babel/types"
import {
  CallExpression,
  Expression,
  Identifier,
  ObjectExpression,
  ObjectProperty,
} from "@babel/types"
import type { NodePath } from "@babel/traverse"

import { Tokens } from "./icu"
import { JsMacroName } from "./constants"
import { createMessageDescriptorFromTokens } from "./messageDescriptorUtils"
import {
  isLinguiIdentifier,
  isDefineMessage,
  tokenizeTemplateLiteral,
  tokenizeNode,
  processDescriptor,
  createMacroJsContext,
  MacroJsContext,
} from "./macroJsAst"

export type MacroJsOpts = {
  i18nImportName: string
  useLinguiImportName: string

  stripNonEssentialProps: boolean
  stripMessageProp: boolean
  isLinguiIdentifier: (node: Identifier, macro: JsMacroName) => boolean
}

export class MacroJs {
  // Identifier of i18n object
  i18nImportName: string
  useLinguiImportName: string

  needsUseLinguiImport = false
  needsI18nImport = false

  _ctx: MacroJsContext

  constructor(opts: MacroJsOpts) {
    this.i18nImportName = opts.i18nImportName
    this.useLinguiImportName = opts.useLinguiImportName

    this._ctx = createMacroJsContext(
      opts.isLinguiIdentifier,
      opts.stripNonEssentialProps,
      opts.stripMessageProp,
    )
  }

  private replacePathWithMessage = (
    path: NodePath,
    tokens: Tokens,
    linguiInstance?: babelTypes.Expression,
  ) => {
    return this.createI18nCall(
      createMessageDescriptorFromTokens(
        tokens,
        path.node.loc,
        this._ctx.stripNonEssentialProps,
        this._ctx.stripMessageProp,
      ),
      linguiInstance,
    )
  }

  replacePath = (path: NodePath): false | babelTypes.Expression => {
    const ctx = this._ctx

    // defineMessage({ message: "Message", context: "My" }) -> {id: <hash + context>, message: "Message"}
    if (
      //
      path.isCallExpression() &&
      isDefineMessage(path.get("callee").node, ctx)
    ) {
      return processDescriptor(
        path.get("arguments")[0].node as ObjectExpression,
        ctx,
      )
    }

    // defineMessage`Message` -> {id: <hash>, message: "Message"}
    if (
      path.isTaggedTemplateExpression() &&
      isDefineMessage(path.get("tag").node, ctx)
    ) {
      const tokens = tokenizeTemplateLiteral(path.get("quasi").node, ctx)
      return createMessageDescriptorFromTokens(
        tokens,
        path.node.loc,
        ctx.stripNonEssentialProps,
        ctx.stripMessageProp,
      )
    }

    if (path.isTaggedTemplateExpression()) {
      const tag = path.get("tag")

      // t(i18nInstance)`Message` -> i18nInstance._(messageDescriptor)
      if (
        tag.isCallExpression() &&
        tag.get("arguments")[0]?.isExpression() &&
        isLinguiIdentifier(tag.get("callee").node, JsMacroName.t, ctx)
      ) {
        // Use the first argument as i18n instance instead of the default i18n instance
        const i18nInstance = tag.get("arguments")[0].node as Expression
        const tokens = tokenizeNode(path.node, false, ctx)

        return this.replacePathWithMessage(path, tokens, i18nInstance)
      }
    }

    // t(i18nInstance)(messageDescriptor) -> i18nInstance._(messageDescriptor)
    if (path.isCallExpression()) {
      const callee = path.get("callee")

      if (
        callee.isCallExpression() &&
        callee.get("arguments")[0]?.isExpression() &&
        isLinguiIdentifier(callee.get("callee").node, JsMacroName.t, ctx)
      ) {
        const i18nInstance = callee.node.arguments[0] as Expression
        return this.replaceTAsFunction(
          path.node as CallExpression,
          ctx,
          i18nInstance,
        )
      }
    }

    // t({...})
    if (
      path.isCallExpression() &&
      isLinguiIdentifier(path.get("callee").node, JsMacroName.t, ctx)
    ) {
      this.needsI18nImport = true
      return this.replaceTAsFunction(path.node, ctx)
    }

    // { t } = useLingui()
    if (
      path.isCallExpression() &&
      isLinguiIdentifier(path.get("callee").node, JsMacroName.useLingui, ctx)
    ) {
      this.needsUseLinguiImport = true
      return this.processUseLingui(path, ctx)
    }

    const tokens = tokenizeNode(path.node, true, ctx)

    if (tokens) {
      this.needsI18nImport = true
      return this.replacePathWithMessage(path, tokens)
    }

    return false
  }

  /**
   * macro `t` is called with MessageDescriptor, after that
   * we create a new node to append it to i18n._
   */
  private replaceTAsFunction = (
    node: CallExpression,
    ctx: MacroJsContext,
    linguiInstance?: babelTypes.Expression,
  ): babelTypes.CallExpression => {
    let arg: Expression = node.arguments[0] as Expression

    if (t.isObjectExpression(arg)) {
      arg = processDescriptor(arg, ctx)
    }

    return this.createI18nCall(arg, linguiInstance)
  }

  /**
   * Receives reference to `useLingui()` call
   *
   * Finds every usage of { t } destructured from the call
   * and process each reference as usual `t` macro.
   *
   * const { t } = useLingui()
   * t`Message`
   *
   * ↓ ↓ ↓ ↓ ↓ ↓
   *
   * const { _: _t } = useLingui()
   * _t({id: <hash>, message: "Message"})
   */
  processUseLingui(path: NodePath<CallExpression>, ctx: MacroJsContext) {
    /*
     * path is CallExpression eq:
     * useLingui()
     *
     * path.parentPath should be a VariableDeclarator eq:
     * const { t } = useLingui()
     */
    if (!path.parentPath.isVariableDeclarator()) {
      throw new Error(
        `\`useLingui\` macro must be used in variable declaration.

 Example:

 const { t } = useLingui()
      `,
      )
    }

    // looking for `t` property in left side assigment
    // in the declarator `const { t } = useLingui()`
    const varDec = path.parentPath.node

    if (!t.isObjectPattern(varDec.id)) {
      // Enforce destructuring `t` from `useLingui` macro to prevent misuse
      throw new Error(
        `You have to destructure \`t\` when using the \`useLingui\` macro, i.e:
 const { t } = useLingui()
 or
 const { t: _ } = useLingui()
 `,
      )
    }

    const _property = t.isObjectPattern(varDec.id)
      ? varDec.id.properties.find(
          (
            property,
          ): property is ObjectProperty & {
            value: Identifier
            key: Identifier
          } =>
            t.isObjectProperty(property) &&
            t.isIdentifier(property.key) &&
            t.isIdentifier(property.value) &&
            property.key.name == "t",
        )
      : null

    const newNode = t.callExpression(t.identifier(this.useLinguiImportName), [])

    if (!_property) {
      return newNode
    }

    const uniqTIdentifier = path.scope.generateUidIdentifier("t")

    path.scope
      .getBinding(_property.value.name)
      ?.referencePaths.forEach((refPath) => {
        // reference usually points to Identifier,
        // parent would be an Expression with this identifier which we are interesting in
        const currentPath = refPath.parentPath

        const _ctx = createMacroJsContext(
          ctx.isLinguiIdentifier,
          ctx.stripNonEssentialProps,
          ctx.stripMessageProp,
        )

        // { t } = useLingui()
        // t`Hello!`
        if (currentPath.isTaggedTemplateExpression()) {
          const tokens = tokenizeTemplateLiteral(currentPath.node, _ctx)

          const descriptor = createMessageDescriptorFromTokens(
            tokens,
            currentPath.node.loc,
            _ctx.stripNonEssentialProps,
            _ctx.stripMessageProp,
          )

          const callExpr = t.callExpression(
            t.identifier(uniqTIdentifier.name),
            [descriptor],
          )

          return currentPath.replaceWith(callExpr)
        }

        // { t } = useLingui()
        // t(messageDescriptor)
        if (
          currentPath.isCallExpression() &&
          currentPath.get("arguments")[0]?.isObjectExpression()
        ) {
          const descriptor = processDescriptor(
            (currentPath.get("arguments")[0] as NodePath<ObjectExpression>)
              .node,
            _ctx,
          )
          const callExpr = t.callExpression(
            t.identifier(uniqTIdentifier.name),
            [descriptor],
          )

          return currentPath.replaceWith(callExpr)
        }

        // for rest of cases just rename identifier for run-time counterpart
        refPath.replaceWith(t.identifier(uniqTIdentifier.name))
      })

    // assign uniq identifier for runtime `_`
    // { t } = useLingui() -> { _ : _t } = useLingui()
    _property.key.name = "_"
    _property.value.name = uniqTIdentifier.name

    return t.callExpression(t.identifier(this.useLinguiImportName), [])
  }

  private createI18nCall(
    messageDescriptor: Expression | undefined,
    linguiInstance?: Expression,
  ) {
    return t.callExpression(
      t.memberExpression(
        linguiInstance ?? t.identifier(this.i18nImportName),
        t.identifier("_"),
      ),
      messageDescriptor ? [messageDescriptor] : [],
    )
  }
}
