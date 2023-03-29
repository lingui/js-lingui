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
} from "@babel/types"
import { NodePath } from "@babel/traverse"

import ICUMessageFormat, {
  ArgToken,
  ElementToken,
  TextToken,
  Token,
} from "./icu"
import { makeCounter } from "./utils"
import { COMMENT, CONTEXT, ID, MESSAGE } from "./constants"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

const pluralRuleRe = /(_[\d\w]+|zero|one|two|few|many|other)/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

type JSXChildPath = NodePath<JSXElement["children"][number]>

// replace whitespace before/after newline with single space
const keepSpaceRe = /\s*(?:\r\n|\r|\n)+\s*/g
// remove whitespace before/after tag or expression
const stripAroundTagsRe =
  /(?:([>}])(?:\r\n|\r|\n)+\s*|(?:\r\n|\r|\n)+\s*(?=[<{]))/g

function maybeNodeValue(node: Node): string {
  if (!node) return null
  if (node.type === "StringLiteral") return node.value
  if (node.type === "JSXAttribute") return maybeNodeValue(node.value)
  if (node.type === "JSXExpressionContainer")
    return maybeNodeValue(node.expression)
  if (node.type === "TemplateLiteral" && node.expressions.length === 0)
    return node.quasis[0].value.raw
  return null
}

export function normalizeWhitespace(text: string): string {
  return (
    text
      .replace(stripAroundTagsRe, "$1")
      .replace(keepSpaceRe, " ")
      // keep escaped newlines
      .replace(/\\n/g, "\n")
      .replace(/\\s/g, " ")
      // we remove trailing whitespace inside Plural
      .replace(/(\s+})/gm, "}")
      // we remove leading whitespace inside Plural
      .replace(/({\s+)/gm, "{")
      .trim()
  )
}

export type MacroJsxOpts = {
  stripNonEssentialProps: boolean
  nameMap: Map<string, string>
}

export default class MacroJSX {
  types: typeof babelTypes
  expressionIndex = makeCounter()
  elementIndex = makeCounter()
  stripNonEssentialProps: boolean
  nameMap: Map<string, string>
  nameMapReversed: Map<string, string>

  constructor({ types }: { types: typeof babelTypes }, opts: MacroJsxOpts) {
    this.types = types
    this.stripNonEssentialProps = opts.stripNonEssentialProps
    this.nameMap = opts.nameMap
    this.nameMapReversed = Array.from(opts.nameMap.entries()).reduce(
      (map, [key, value]) => map.set(value, key),
      new Map()
    )
  }

  createStringJsxAttribute = (name: string, value: string) => {
    // This handles quoted JSX attributes and html entities.
    return this.types.jsxAttribute(
      this.types.jsxIdentifier(name),
      this.types.jsxExpressionContainer(this.types.stringLiteral(value))
    )
  }

  replacePath = (path: NodePath) => {
    const tokens = this.tokenizeNode(path)

    const messageFormat = new ICUMessageFormat()
    const {
      message: messageRaw,
      values,
      jsxElements,
    } = messageFormat.fromTokens(tokens)
    const message = normalizeWhitespace(messageRaw)

    const { attributes, id, comment, context } = this.stripMacroAttributes(
      path as NodePath<JSXElement>
    )

    if (!id && !message) {
      return
    }

    if (id) {
      attributes.push(
        this.types.jsxAttribute(
          this.types.jsxIdentifier(ID),
          this.types.stringLiteral(id)
        )
      )
    } else {
      attributes.push(
        this.createStringJsxAttribute(ID, generateMessageId(message, context))
      )
    }

    if (!this.stripNonEssentialProps) {
      if (message) {
        attributes.push(this.createStringJsxAttribute(MESSAGE, message))
      }

      if (comment) {
        attributes.push(
          this.types.jsxAttribute(
            this.types.jsxIdentifier(COMMENT),
            this.types.stringLiteral(comment)
          )
        )
      }

      if (context) {
        attributes.push(
          this.types.jsxAttribute(
            this.types.jsxIdentifier(CONTEXT),
            this.types.stringLiteral(context)
          )
        )
      }
    }

    // Parameters for variable substitution
    const valuesObject = Object.keys(values).map((key) =>
      this.types.objectProperty(this.types.identifier(key), values[key])
    )

    if (valuesObject.length) {
      attributes.push(
        this.types.jsxAttribute(
          this.types.jsxIdentifier("values"),
          this.types.jsxExpressionContainer(
            this.types.objectExpression(valuesObject)
          )
        )
      )
    }

    // Inline elements
    if (Object.keys(jsxElements).length) {
      attributes.push(
        this.types.jsxAttribute(
          this.types.jsxIdentifier("components"),
          this.types.jsxExpressionContainer(
            this.types.objectExpression(
              Object.keys(jsxElements).map((key) =>
                this.types.objectProperty(
                  this.types.identifier(key),
                  jsxElements[key]
                )
              )
            )
          )
        )
      )
    }

    const newNode = this.types.jsxElement(
      this.types.jsxOpeningElement(
        this.types.jsxIdentifier("Trans"),
        attributes,
        true
      ),
      null,
      [],
      true
    )
    newNode.loc = path.node.loc

    path.replaceWith(newNode)
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
    const id = attributes.find(this.attrName([ID]))
    const message = attributes.find(this.attrName([MESSAGE]))
    const comment = attributes.find(this.attrName([COMMENT]))
    const context = attributes.find(this.attrName([CONTEXT]))

    let reserved = [ID, MESSAGE, COMMENT, CONTEXT]

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

  tokenizeNode = (path: NodePath): Token[] => {
    if (this.isTransComponent(path)) {
      // t
      return this.tokenizeTrans(path)
    } else if (this.isChoiceComponent(path)) {
      // plural, select and selectOrdinal
      return [this.tokenizeChoiceComponent(path)]
    } else if (path.isJSXElement()) {
      return [this.tokenizeElement(path)]
    } else {
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
        // Escape forced newlines to keep them in message.
        return [this.tokenizeText(exp.node.value.replace(/\n/g, "\\n"))]
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
      // just do nothing
    } else if (path.isJSXText()) {
      return [this.tokenizeText(path.node.value)]
    } else {
      // impossible path
      // return this.tokenizeText(node.value)
    }
  }

  tokenizeTemplateLiteral(exp: NodePath<TemplateLiteral>): Token[] {
    const expressions = exp.get("expressions") as NodePath<Expression>[]

    return exp.get("quasis").flatMap(({ node: text }, i) => {
      // if it's an unicode we keep the cooked value because it's the parsed value by babel (without unicode chars)
      // This regex will detect if a string contains unicode chars, when they're we should interpolate them
      // why? because platforms like react native doesn't parse them, just doing a JSON.parse makes them UTF-8 friendly
      const value = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g.test(text.value.raw)
        ? text.value.cooked
        : text.value.raw

      let argTokens: Token[] = []
      const currExp = expressions[i]

      if (currExp) {
        argTokens = currExp.isCallExpression()
          ? this.tokenizeNode(currExp)
          : [this.tokenizeExpression(currExp)]
      }

      return [
        ...(value ? [this.tokenizeText(this.clearBackslashes(value))] : []),
        ...argTokens,
      ]
    })
  }

  tokenizeChoiceComponent = (path: NodePath<JSXElement>): Token => {
    const element = path.get("openingElement")
    const name = this.getJsxTagName(path.node)

    const format = (this.nameMapReversed.get(name) || name).toLowerCase()
    const props = element.get("attributes").filter((attr) => {
      return this.attrName(
        [
          ID,
          COMMENT,
          MESSAGE,
          CONTEXT,
          "key",
          // we remove <Trans /> react props that are not useful for translation
          "render",
          "component",
          "components",
        ],
        true
      )(attr.node)
    })

    const token: Token = {
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
        const exp = value.isLiteral() ? value : value.get("expression")

        token.name = this.expressionToArgument(exp)
        token.value = exp.node as Expression
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
    const name = this.elementIndex()

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
    return {
      type: "arg",
      name: this.expressionToArgument(path),
      value: path.node as Expression,
    }
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

    return {
      type: "arg",
      name: this.expressionToArgument(exp),
      value: exp.node,
    }
  }

  tokenizeText = (value: string): TextToken => {
    return {
      type: "text",
      value,
    }
  }

  expressionToArgument(path: NodePath<Expression | Node>): string {
    return path.isIdentifier() ? path.node.name : String(this.expressionIndex())
  }

  /**
   * We clean '//\` ' to just '`'
   **/
  clearBackslashes(value: string): string {
    // if not we replace the extra scaped literals
    return value.replace(/\\`/g, "`")
  }

  isLinguiComponent = (
    path: NodePath,
    name: string
  ): path is NodePath<JSXElement> => {
    return (
      path.isJSXElement() &&
      this.types.isJSXIdentifier(path.node.openingElement.name, {
        name: this.nameMap.get(name) || name,
      })
    )
  }

  isTransComponent = (path: NodePath): path is NodePath<JSXElement> => {
    return this.isLinguiComponent(path, "Trans")
  }

  isChoiceComponent = (path: NodePath): path is NodePath<JSXElement> => {
    return (
      this.isLinguiComponent(path, "Plural") ||
      this.isLinguiComponent(path, "Select") ||
      this.isLinguiComponent(path, "SelectOrdinal")
    )
  }

  getJsxTagName = (node: JSXElement): string => {
    if (this.types.isJSXIdentifier(node.openingElement.name)) {
      return node.openingElement.name.name
    }
  }
}
