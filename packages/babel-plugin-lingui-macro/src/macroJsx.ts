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
import {
  JsxMacroName,
  MACRO_REACT_PACKAGE,
  MACRO_LEGACY_PACKAGE,
  MsgDescriptorPropKey,
  JsMacroName,
} from "./constants"
import cleanJSXElementLiteralChild from "./utils/cleanJSXElementLiteralChild"
import { createMessageDescriptorFromTokens } from "./messageDescriptorUtils"
import {
  createMacroJsContext,
  MacroJsContext,
  tokenizeExpression,
} from "./macroJsAst"

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
}

export type MacroJsxOpts = {
  stripNonEssentialProps: boolean
  stripMessageProp: boolean
  transImportName: string
  isLinguiIdentifier: (node: Identifier, macro: JsMacroName) => boolean
}

export class MacroJSX {
  types: typeof babelTypes
  ctx: MacroJsxContext

  constructor({ types }: { types: typeof babelTypes }, opts: MacroJsxOpts) {
    this.types = types

    this.ctx = {
      ...createMacroJsContext(
        opts.isLinguiIdentifier,
        opts.stripNonEssentialProps,
        opts.stripMessageProp
      ),
      transImportName: opts.transImportName,
      elementIndex: makeCounter(),
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

    const { attributes, id, comment, context } = this.stripMacroAttributes(
      path as NodePath<JSXElement>
    )

    if (!tokens.length) {
      throw new Error("Incorrect usage of Trans")
    }

    const messageDescriptor = createMessageDescriptorFromTokens(
      tokens,
      path.node.loc,
      this.ctx.stripNonEssentialProps,
      this.ctx.stripMessageProp,
      {
        id,
        context,
        comment,
      }
    )

    attributes.push(this.types.jsxSpreadAttribute(messageDescriptor))

    const newNode = this.types.jsxElement(
      this.types.jsxOpeningElement(
        this.types.jsxIdentifier(this.ctx.transImportName),
        attributes,
        true
      ),
      null,
      [],
      true
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
      this.attrName([MsgDescriptorPropKey.message])
    )
    const comment = attributes.find(
      this.attrName([MsgDescriptorPropKey.comment])
    )
    const context = attributes.find(
      this.attrName([MsgDescriptorPropKey.context])
    )

    let reserved: string[] = [
      MsgDescriptorPropKey.id,
      MsgDescriptorPropKey.message,
      MsgDescriptorPropKey.comment,
      MsgDescriptorPropKey.context,
    ]

    if (this.isChoiceComponent(path)) {
      reserved = [
        ...reserved,
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
    ignoreElement = false
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
          componentName
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
        "Incorrect usage of Trans: Spread could not be used as Trans children"
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
    componentName: JsxMacroName
  ): Token => {
    const element = path.get("openingElement")

    const format = componentName.toLowerCase()
    const props = element.get("attributes").filter((attr) => {
      return this.attrName(
        [
          MsgDescriptorPropKey.id,
          MsgDescriptorPropKey.comment,
          MsgDescriptorPropKey.message,
          MsgDescriptorPropKey.context,
          "key",
          // we remove <Trans /> react props that are not useful for translation
          "render",
          "component",
          "components",
        ],
        true
      )(attr.node)
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
            value.isLiteral() ? value : value.get("expression")
          ),
        }
      } else if (format !== "select" && name === "offset") {
        // offset is static parameter, so it must be either string or number
        token.options.offset =
          value.isStringLiteral() || value.isNumericLiteral()
            ? (value.node.value as string)
            : (
                (value as NodePath<JSXExpressionContainer>).get(
                  "expression"
                ) as NodePath<StringLiteral>
              ).node.value
      } else {
        let option: ArgToken["options"][number]

        if (value.isStringLiteral()) {
          option = (value.node.extra.raw as string).replace(
            /(["'])(.*)\1/,
            "$2"
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
    // !!! Important: Calculate element index before traversing children.
    // That way outside elements are numbered before inner elements. (...and it looks pretty).
    const name = this.ctx.elementIndex()

    return {
      type: "element",
      name,
      value: {
        ...path.node,
        children: [],
        openingElement: {
          ...path.node.openingElement,
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
    exp: NodePath<ConditionalExpression>
  ): ArgToken => {
    exp.traverse({
      JSXElement: (el) => {
        if (this.isTransComponent(el) || this.isChoiceComponent(el)) {
          this.replacePath(el)
          el.skip()
        }
      },
    })

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
    name: JsxMacroName
  ): path is NodePath<JSXElement> => {
    if (!path.isJSXElement()) {
      return false
    }

    const identifier = path.get("openingElement").get("name")

    return (
      identifier.referencesImport(MACRO_REACT_PACKAGE, name) ||
      identifier.referencesImport(MACRO_LEGACY_PACKAGE, name)
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
