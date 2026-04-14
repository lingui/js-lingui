import * as babelTypes from "@babel/types"
import {
  ConditionalExpression,
  Expression,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXSpreadAttribute,
  Literal,
  Node,
  StringLiteral,
  TemplateLiteral,
  SourceLocation,
  Identifier,
} from "@babel/types"
import type { NodePath } from "@babel/traverse"

import { ArgToken, ElementToken, TextToken, Token } from "./icu"
import { makeCounter } from "./utils"
import { JsxMacroName, MsgDescriptorPropKey, JsMacroName } from "./constants"
import cleanJSXElementLiteralChild from "./utils/cleanJSXElementLiteralChild"
import {
  createMessageDescriptorFromTokens,
  ResolvedDescriptorFields,
} from "./messageDescriptorUtils"
import {
  createMacroJsContext,
  MacroJsContext,
  tokenizeExpression,
} from "./macroJsAst"
import { LinguiConfigNormalized } from "@lingui/conf"
import { PluginPass } from "@babel/core"

const pluralRuleRe = /(_[\d\w]+|zero|one|two|few|many|other)/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

type JSXChildPath = NodePath<JSXElement["children"][number]>

function maybeNodeValue(node: Node): { text: string; loc: SourceLocation } {
  if (!node) return null
  if (node.type === "StringLiteral") return { text: node.value, loc: node.loc }
  if (node.type === "JSXAttribute") return maybeNodeValue(node.value)
  if (node.type === "JSXExpressionContainer")
    return maybeNodeValue(node.expression)
  if (node.type === "TemplateLiteral" && node.expressions.length === 0)
    return { text: node.quasis[0].value.raw, loc: node.loc }
  return null
}

export type MacroJsxContext = MacroJsContext & {
  elementIndex: () => number
  transImportName: string
  elementsTracking: Map<string, JSXElement>
  jsxPlaceholderAttribute?: string
  jsxPlaceholderDefaults?: Record<string, string>
}

export type MacroJsxOpts = {
  descriptorFields: ResolvedDescriptorFields
  transImportName: string
  isLinguiIdentifier: (node: Identifier, macro: JsMacroName) => boolean
  getDirective?: MacroJsContext["getDirective"]
  jsxPlaceholderAttribute?: string
  jsxPlaceholderDefaults?: Record<string, string>
}

const choiceComponentAttributesWhitelist = [
  "_\\w+",
  "_\\d+",
  "zero",
  "one",
  "two",
  "few",
  "many",
  "other",
  "value",
  "offset",
]

export class MacroJSX {
  types: typeof babelTypes
  ctx: MacroJsxContext

  constructor({ types }: { types: typeof babelTypes }, opts: MacroJsxOpts) {
    this.types = types

    this.ctx = {
      ...createMacroJsContext(
        opts.isLinguiIdentifier,
        opts.descriptorFields,
        opts.getDirective,
      ),
      transImportName: opts.transImportName,
      elementIndex: makeCounter(),
      elementsTracking: new Map(),
      jsxPlaceholderAttribute: opts.jsxPlaceholderAttribute,
      jsxPlaceholderDefaults: opts.jsxPlaceholderDefaults,
    }
  }

  replacePath = (path: NodePath): false | Node => {
    if (!path.isJSXElement()) {
      return false
    }

    const tokens = this.tokenizeNode(path, true, true)

    if (!tokens) {
      return false
    }

    if (!tokens.length) {
      throw new Error("Incorrect usage of Trans")
    }

    const directive = this.ctx.getDirective(path.node.loc?.start.line)

    const { attributes, id, comment, context } = this.stripMacroAttributes(
      path as NodePath<JSXElement>,
    )

    const messageDescriptor = createMessageDescriptorFromTokens(
      tokens,
      path.node.loc,
      this.ctx.descriptorFields,
      {
        ...directive,
        id,
        context: context ?? directive?.context,
        comment: comment ?? directive?.comment,
      },
    )

    attributes.push(this.types.jsxSpreadAttribute(messageDescriptor))

    const newNode = this.types.jsxElement(
      this.types.jsxOpeningElement(
        this.types.jsxIdentifier(this.ctx.transImportName),
        attributes,
        true,
      ),
      null,
      [],
      true,
    )
    newNode.loc = path.node.loc

    return newNode
  }

  attrName = (names: string[], exclude = false) => {
    const namesRe = new RegExp("^(" + names.join("|") + ")$")
    return (attr: JSXAttribute | JSXSpreadAttribute) => {
      const name = ((attr as JSXAttribute).name as JSXIdentifier).name
      return exclude ? !namesRe.test(name) : namesRe.test(name)
    }
  }

  stripMacroAttributes = (path: NodePath<JSXElement>) => {
    const { attributes } = path.node.openingElement
    const id = attributes.find(this.attrName([MsgDescriptorPropKey.id]))
    const message = attributes.find(
      this.attrName([MsgDescriptorPropKey.message]),
    )
    const comment = attributes.find(
      this.attrName([MsgDescriptorPropKey.comment]),
    )
    const context = attributes.find(
      this.attrName([MsgDescriptorPropKey.context]),
    )

    let reserved: string[] = [
      MsgDescriptorPropKey.id,
      MsgDescriptorPropKey.message,
      MsgDescriptorPropKey.comment,
      MsgDescriptorPropKey.context,
    ]

    if (this.isChoiceComponent(path)) {
      reserved = [...reserved, ...choiceComponentAttributesWhitelist]
    }

    return {
      id: maybeNodeValue(id),
      message: maybeNodeValue(message),
      comment: maybeNodeValue(comment),
      context: maybeNodeValue(context),
      attributes: attributes.filter(this.attrName(reserved, true)),
    }
  }

  tokenizeNode = (
    path: NodePath,
    ignoreExpression = false,
    ignoreElement = false,
  ): Token[] => {
    if (this.isTransComponent(path)) {
      // t
      return this.tokenizeTrans(path)
    }

    const componentName = this.isChoiceComponent(path)

    if (componentName) {
      // plural, select and selectOrdinal
      return [
        this.tokenizeChoiceComponent(
          path as NodePath<JSXElement>,
          componentName,
        ),
      ]
    }

    if (path.isJSXElement() && !ignoreElement) {
      return [this.tokenizeElement(path)]
    }

    if (!ignoreExpression) {
      return [this.tokenizeExpression(path)]
    }
  }

  tokenizeTrans = (path: NodePath<JSXElement>): Token[] => {
    return path
      .get("children")
      .flatMap((child) => this.tokenizeChildren(child))
      .filter(Boolean)
  }

  tokenizeChildren = (path: JSXChildPath): Token[] => {
    if (path.isJSXExpressionContainer()) {
      const exp = path.get("expression") as NodePath<Expression>

      // Ignore JSX comments like {/* comment */} - they should not affect
      // the message or consume expression indices
      if (exp.isJSXEmptyExpression()) {
        return []
      }

      if (exp.isStringLiteral()) {
        return [this.tokenizeText(exp.node.value)]
      }
      if (exp.isTemplateLiteral()) {
        return this.tokenizeTemplateLiteral(exp)
      }
      if (exp.isConditionalExpression()) {
        return [this.tokenizeConditionalExpression(exp)]
      }

      if (exp.isJSXElement()) {
        return this.tokenizeNode(exp)
      }
      return [this.tokenizeExpression(exp)]
    } else if (path.isJSXElement()) {
      return this.tokenizeNode(path)
    } else if (path.isJSXSpreadChild()) {
      throw new Error(
        "Incorrect usage of Trans: Spread could not be used as Trans children",
      )
    } else if (path.isJSXText()) {
      return [this.tokenizeText(cleanJSXElementLiteralChild(path.node.value))]
    } else {
      // impossible path
      // return this.tokenizeText(node.value)
    }
  }

  tokenizeTemplateLiteral(exp: NodePath<TemplateLiteral>): Token[] {
    const expressions = exp.get("expressions") as NodePath<Expression>[]

    return exp.get("quasis").flatMap(({ node: text }, i) => {
      const value = text.value.cooked

      let argTokens: Token[] = []
      const currExp = expressions[i]

      if (currExp) {
        argTokens = currExp.isCallExpression()
          ? this.tokenizeNode(currExp)
          : [this.tokenizeExpression(currExp)]
      }

      return [...(value ? [this.tokenizeText(value)] : []), ...argTokens]
    })
  }

  tokenizeChoiceComponent = (
    path: NodePath<JSXElement>,
    componentName: JsxMacroName,
  ): Token => {
    const element = path.get("openingElement")

    const format = componentName.toLowerCase()
    const props = element.get("attributes").filter((attr) => {
      return this.attrName(choiceComponentAttributesWhitelist)(attr.node)
    })

    let token: Token = {
      type: "arg",
      format,
      name: null,
      value: undefined,
      options: {
        offset: undefined,
      },
    }

    for (const _attr of props) {
      if (_attr.isJSXSpreadAttribute()) {
        continue
      }

      const attr = _attr as NodePath<JSXAttribute>

      if (this.types.isJSXNamespacedName(attr.node.name)) {
        continue
      }

      const name = attr.node.name.name
      const value = attr.get("value") as
        | NodePath<Literal>
        | NodePath<JSXExpressionContainer>

      if (name === "value") {
        token = {
          ...token,
          ...this.tokenizeExpression(
            value.isLiteral() ? value : value.get("expression"),
          ),
        }
      } else if (format !== "select" && name === "offset") {
        // offset is static parameter, so it must be either string or number
        token.options.offset =
          value.isStringLiteral() || value.isNumericLiteral()
            ? (value.node.value as string)
            : (
                (value as NodePath<JSXExpressionContainer>).get(
                  "expression",
                ) as NodePath<StringLiteral>
              ).node.value
      } else {
        let option: ArgToken["options"][number]

        if (value.isStringLiteral()) {
          option = (value.node.extra.raw as string).replace(
            /(["'])(.*)\1/,
            "$2",
          )
        } else {
          option = this.tokenizeChildren(value as JSXChildPath)
        }

        if (pluralRuleRe.test(name)) {
          token.options[jsx2icuExactChoice(name)] = option
        } else {
          token.options[name] = option
        }
      }
    }

    return token
  }

  tokenizeElement = (path: NodePath<JSXElement>): ElementToken => {
    const {
      jsxPlaceholderAttribute,
      jsxPlaceholderDefaults,
      elementsTracking,
    } = this.ctx

    let node = path.node
    let name: string | undefined = undefined

    if (jsxPlaceholderAttribute) {
      const { attributes } = node.openingElement
      const attrIndex = attributes.findIndex(
        (attr) =>
          attr.type === "JSXAttribute" &&
          attr.name.name === jsxPlaceholderAttribute,
      )

      if (attrIndex !== -1) {
        const attr = attributes[attrIndex] as JSXAttribute
        if (
          !attr.value ||
          attr.value.type !== "StringLiteral" ||
          !attr.value.value
        ) {
          throw path.buildCodeFrameError(
            `The \`${jsxPlaceholderAttribute}\` attribute must be a non-empty string literal.`,
          )
        }
        name = attr.value.value

        const newAttributes = [...attributes]
        newAttributes.splice(attrIndex, 1)

        node = {
          ...node,
          openingElement: {
            ...node.openingElement,
            attributes: newAttributes,
          },
        }
      }
    }

    if (!name && jsxPlaceholderDefaults) {
      const tagName = node.openingElement.name
      if (tagName.type === "JSXIdentifier") {
        name = jsxPlaceholderDefaults[tagName.name]
      }
    }

    if (!name) {
      name = String(this.ctx.elementIndex())
      elementsTracking.set(name, node)
    } else {
      if (/^\d+$/.test(name)) {
        throw path.buildCodeFrameError(
          `Placeholder name \`${name}\` is not allowed because it conflicts with auto-generated numeric placeholders. Use a non-numeric name instead.`,
        )
      }
      if (!/^[a-zA-Z_]([\w.-]*\w)?$/.test(name)) {
        throw path.buildCodeFrameError(
          `Placeholder name \`${name}\` is not valid. Names must start and end with a letter/digit/underscore, but may contain \`.-\` in between.`,
        )
      }

      const existingElement = elementsTracking.get(name)

      if (existingElement) {
        const existingTag = existingElement.openingElement.name
        const currentTag = node.openingElement.name
        const existingAttrs = existingElement.openingElement.attributes
        const openingAttrs = node.openingElement.attributes

        const hasSpreads = existingAttrs.some(
          (a) => a.type === "JSXSpreadAttribute",
        )

        // When spreads are present, attribute order matters for React
        // semantics so we compare positionally. Otherwise, order-insensitive.
        const attrsEqual =
          existingAttrs.length === openingAttrs.length &&
          (hasSpreads
            ? existingAttrs.every((a, i) =>
                this.types.isNodesEquivalent(a, openingAttrs[i]),
              )
            : existingAttrs.every((a) =>
                openingAttrs.some((b) => this.types.isNodesEquivalent(a, b)),
              ))

        if (
          !this.types.isNodesEquivalent(existingTag, currentTag) ||
          !attrsEqual
        ) {
          const eg = `(e.g. \`<element ${jsxPlaceholderAttribute || "_t"}="newName" />\`)`
          const msg =
            `Multiple distinct JSX elements with the same placeholder name (\`${name}\`). ` +
            (jsxPlaceholderAttribute
              ? `Differentiate them by adding/modifying the \`${jsxPlaceholderAttribute}\` attribute ${eg}.`
              : `Differentiate them by setting \`macro.jsxPlaceholderAttribute\` in the lingui config and then adding the attribute to your JSX elements ${eg}.`)
          throw path.buildCodeFrameError(msg)
        }
      } else {
        elementsTracking.set(name, node)
      }
    }

    return {
      type: "element",
      name,
      value: {
        ...node,
        children: [],
        openingElement: {
          ...node.openingElement,
          selfClosing: true,
        },
      },
      children: this.tokenizeTrans(path),
    }
  }

  tokenizeExpression = (path: NodePath<Expression | Node>): ArgToken => {
    return tokenizeExpression(path.node, this.ctx)
  }

  tokenizeConditionalExpression = (
    exp: NodePath<ConditionalExpression>,
  ): ArgToken => {
    exp.traverse(
      {
        JSXElement: (el) => {
          if (this.isTransComponent(el) || this.isChoiceComponent(el)) {
            this.replacePath(el)
            el.skip()
          }
        },
      },
      exp.state,
    )

    return this.tokenizeExpression(exp)
  }

  tokenizeText = (value: string): TextToken => {
    return {
      type: "text",
      value,
    }
  }

  isLinguiComponent = (
    path: NodePath,
    name: JsxMacroName,
  ): path is NodePath<JSXElement> => {
    if (!path.isJSXElement()) {
      return false
    }

    const config = (path.context.state as PluginPass).get(
      "linguiConfig",
    ) as LinguiConfigNormalized
    const identifier = path.get("openingElement").get("name")

    return config.macro.jsxPackage.some((moduleSource) =>
      identifier.referencesImport(moduleSource, name),
    )
  }

  isTransComponent = (path: NodePath): path is NodePath<JSXElement> => {
    return this.isLinguiComponent(path, JsxMacroName.Trans)
  }

  isChoiceComponent = (path: NodePath): JsxMacroName => {
    if (this.isLinguiComponent(path, JsxMacroName.Plural)) {
      return JsxMacroName.Plural
    }
    if (this.isLinguiComponent(path, JsxMacroName.Select)) {
      return JsxMacroName.Select
    }
    if (this.isLinguiComponent(path, JsxMacroName.SelectOrdinal)) {
      return JsxMacroName.SelectOrdinal
    }
  }
}
