import * as R from "ramda"
import * as babelTypes from "@babel/types"
import {
  Expression,
  Identifier,
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXIdentifier,
  JSXSpreadAttribute,
  Node,
  StringLiteral
} from "@babel/types"
import {NodePath} from "@babel/traverse"

import ICUMessageFormat, {ArgToken, ElementToken, TextToken, Token, Tokens} from "./icu"
import {makeCounter, zip} from "./utils"
import {COMMENT, CONTEXT, ID, MESSAGE} from "./constants"

const pluralRuleRe = /(_[\d\w]+|zero|one|two|few|many|other)/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

// replace whitespace before/after newline with single space
const keepSpaceRe = /\s*(?:\r\n|\r|\n)+\s*/g
// remove whitespace before/after tag or expression
const stripAroundTagsRe = /(?:([>}])(?:\r\n|\r|\n)+\s*|(?:\r\n|\r|\n)+\s*(?=[<{]))/g

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
      .trim()
  )
}

export default class MacroJSX {
  types: typeof babelTypes
  expressionIndex = makeCounter()
  elementIndex = makeCounter()

  constructor({ types }: {types: typeof babelTypes}) {
    this.types = types
  }

  safeJsxAttribute = (name: string, value: string) => {
    // This handles quoted JSX attributes and html entities.
    return this.types.jsxAttribute(
      this.types.jsxIdentifier(name),
      this.types.jsxExpressionContainer(this.types.stringLiteral(value))
    )
  }

  replacePath = (path: NodePath) => {
    const tokens = this.tokenizeNode(path.node)

    const messageFormat = new ICUMessageFormat()
    const {
      message: messageRaw,
      values,
      jsxElements,
    } = messageFormat.fromTokens(tokens)
    const message = normalizeWhitespace(messageRaw)

    const { attributes, id, comment, context } = this.stripMacroAttributes(path.node as JSXElement)

    if (!id && !message) {
      return
    } else if (id && id !== message) {
      // If `id` prop already exists and generated ID is different,
      // add it as a `default` prop
      attributes.push(
        this.types.jsxAttribute(
          this.types.jsxIdentifier(ID),
          this.types.stringLiteral(id)
        )
      )

      if (process.env.NODE_ENV !== "production") {
        if (message) {
          attributes.push(this.safeJsxAttribute(MESSAGE, message))
        }
      }
    } else {
      attributes.push(this.safeJsxAttribute(ID, message))
    }

    if (process.env.NODE_ENV !== "production") {
      if (comment) {
        attributes.push(
          this.types.jsxAttribute(
            this.types.jsxIdentifier(COMMENT),
            this.types.stringLiteral(comment)
          )
        )
      }
    }

    if (context) {
      attributes.push(
        this.types.jsxAttribute(
          this.types.jsxIdentifier(CONTEXT),
          this.types.stringLiteral(context)
        )
      )
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
        /*selfClosing*/ true
      ),
      /*closingElement*/ null,
      /*children*/ [],
      /*selfClosing*/ true
    )
    newNode.loc = path.node.loc

    path.replaceWith(newNode)
  }

  attrName = (names: string[], exclude = false) => {
    const namesRe = new RegExp("^(" + names.join("|") + ")$")
    return (attr: JSXAttribute | JSXSpreadAttribute) => {
      const name = (((attr as JSXAttribute).name) as JSXIdentifier).name
      return exclude ? !namesRe.test(name) : namesRe.test(name)
    }

  }

  stripMacroAttributes = (node: JSXElement) => {
    const { attributes } = node.openingElement
    const id = attributes.filter(this.attrName([ID]))[0]
    const message = attributes.filter(this.attrName([MESSAGE]))[0]
    const comment = attributes.filter(this.attrName([COMMENT]))[0]
    const context = attributes.filter(this.attrName([CONTEXT]))[0]

    let reserved = [ID, MESSAGE, COMMENT, CONTEXT]
    if (this.isI18nComponent(node)) {
      // no reserved prop names
    } else if (this.isChoiceComponent(node)) {
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

  tokenizeNode = (node: Node): Tokens => {
    if (this.isI18nComponent(node)) {
      // t
      return this.tokenizeTrans(node)
    } else if (this.isChoiceComponent(node)) {
      // plural, select and selectOrdinal
      return this.tokenizeChoiceComponent(node)
    } else if (this.types.isJSXElement(node)) {
      return this.tokenizeElement(node)
    } else {
      return this.tokenizeExpression(node)
    }
  }

  tokenizeTrans = (node: JSXElement): Token[] => {
    return R.flatten(
      node.children.map((child) => this.tokenizeChildren(child)).filter(Boolean)
    )
  }

  tokenizeChildren = (node: JSXElement['children'][number]): Tokens => {
    if (this.types.isJSXExpressionContainer(node)) {
      const exp = node.expression

      if (this.types.isStringLiteral(exp)) {
        // Escape forced newlines to keep them in message.
        return {
          type: "text",
          value: exp.value.replace(/\n/g, "\\n"),
        }
      } else if (this.types.isTemplateLiteral(exp)) {
        const tokenize = R.pipe(
          // Don"t output tokens without text.
          R.evolve({
            quasis: R.map((text: babelTypes.TemplateElement) => {
              // if it's an unicode we keep the cooked value because it's the parsed value by babel (without unicode chars)
              // This regex will detect if a string contains unicode chars, when they're we should interpolate them
              // why? because platforms like react native doesn't parse them, just doing a JSON.parse makes them UTF-8 friendly
              const value = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g.test(text.value.raw) ? text.value.cooked : text.value.raw
              if (value === "") return null

              return this.tokenizeText(this.clearBackslashes(value))
            }),
            expressions: R.map((exp: babelTypes.Expression) =>
              this.types.isCallExpression(exp)
                ? this.tokenizeNode(exp)
                : this.tokenizeExpression(exp)
            ),
          }),
          (exp) => zip(exp.quasis, exp.expressions),
          R.flatten,
          R.filter(Boolean)
        )

        return tokenize(exp)
      } else if (this.types.isJSXElement(exp)) {
        return this.tokenizeNode(exp)
      } else {
        return this.tokenizeExpression(exp)
      }
    } else if (this.types.isJSXElement(node)) {
      return this.tokenizeNode(node)
    } else if (this.types.isJSXSpreadChild(node)) {
      // just do nothing
    } else if (this.types.isJSXText(node)) {
      return this.tokenizeText(node.value)
    } else {
      // impossible path
      // return this.tokenizeText(node.value)
    }
  }

  tokenizeChoiceComponent = (node: JSXElement): Token => {
    const element = node.openingElement
    const format = this.getJsxTagName(node).toLowerCase()
    const props = element.attributes.filter(this.attrName([
      ID,
      COMMENT,
      MESSAGE,
      CONTEXT,
      "key",
      // we remove <Trans /> react props that are not useful for translation
      "render",
      "component",
      "components"
    ], true))

    const token: Token = {
      type: "arg",
      format,
      name: null,
      value: undefined,
      options: {
        offset: undefined,
      },
    }

    for (const attr of props) {
      if (this.types.isJSXSpreadAttribute(attr)) {
        continue;
      }

      if (this.types.isJSXNamespacedName(attr.name)) {
        continue;
      }

      const name = attr.name.name

      if (name === "value") {
        const exp = this.types.isLiteral(attr.value)
          ? attr.value
          : (attr.value as JSXExpressionContainer).expression
        token.name = this.expressionToArgument(exp)
        token.value = exp as Expression
      } else if (format !== "select" && name === "offset") {
        // offset is static parameter, so it must be either string or number
        token.options.offset = this.types.isStringLiteral(attr.value)
          ? attr.value.value
          : ((attr.value as JSXExpressionContainer).expression as StringLiteral).value
      } else {
        let value: ArgToken['options'][number]

        if (this.types.isStringLiteral(attr.value)) {
          value = (attr.value.extra.raw as string).replace(/(["'])(.*)\1/, "$2")
        } else {
          value = this.tokenizeChildren(attr.value)
        }
        if (pluralRuleRe.test(name)) {
          token.options[jsx2icuExactChoice(name)] = value
        } else {
          token.options[name] = value
        }
      }
    }

    return token
  }

  tokenizeElement = (node: JSXElement): ElementToken => {
    // !!! Important: Calculate element index before traversing children.
    // That way outside elements are numbered before inner elements. (...and it looks pretty).
    const name = this.elementIndex()
    const children = R.flatten(node.children
      .map((child) => this.tokenizeChildren(child))
      .filter(Boolean))

    node.children = []
    node.openingElement.selfClosing = true

    return {
      type: "element",
      name,
      value: node,
      children,
    }
  }

  tokenizeExpression = (node: Expression | Node): ArgToken => {
    return {
      type: "arg",
      name: this.expressionToArgument(node),
      value: node as Expression,
    }
  }

  tokenizeText = (value: string): TextToken => {
    return {
      type: "text",
      value,
    }
  }

  expressionToArgument(exp: Expression | Node): string {
    return this.types.isIdentifier(exp) ? exp.name : String(this.expressionIndex())
  }

  /**
   * We clean '//\` ' to just '`'
   **/
  clearBackslashes(value: string): string {
    // if not we replace the extra scaped literals
    return value.replace(/\\`/g, "`")
  }

  /**
   * Custom matchers
   */
  isIdentifier = (node: Node, name: string): node is Identifier => {
    return this.types.isIdentifier(node, { name })
  }

  isI18nComponent = (node: Node, name = "Trans"): node is JSXElement => {
    return (
      this.types.isJSXElement(node) &&
      this.types.isJSXIdentifier(node.openingElement.name, {
        name,
      })
    )
  }

  isChoiceComponent = (node: Node): node is JSXElement => {
    return (
      this.isI18nComponent(node, "Plural") ||
      this.isI18nComponent(node, "Select") ||
      this.isI18nComponent(node, "SelectOrdinal")
    )
  }

  getJsxTagName = (node: JSXElement): string => {
    if ( this.types.isJSXIdentifier(node.openingElement.name)) {
      return node.openingElement.name.name;
    }
  }
}
