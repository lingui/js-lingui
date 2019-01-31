import * as R from "ramda"
import ICUMessageFormat from "./icu"

const pluralRuleRe = /(_[\d\w]+|zero|one|few|many|other)/
const jsx2icuExactChoice = value =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

const makeCounter = (index = 0) => () => index++

// replace whitespace before/after newline with single space
const keepSpaceRe = /\s*(?:\r\n|\r|\n)+\s*/g
// remove whitespace before/after tag or expression
const stripAroundTagsRe = /(?:([>}])(?:\r\n|\r|\n)+\s+|(?:\r\n|\r|\n)+\s+(?=[<{]))/g

function normalizeWhitespace(text) {
  return (
    text
      .replace(stripAroundTagsRe, "$1")
      .replace(keepSpaceRe, " ")
      // keep escaped newlines
      .replace(/\\n/, "\n")
      .trim()
  )
}

export default function MacroJSX({ types }) {
  this.types = types
  this._expressionIndex = makeCounter()
  this._elementIndex = makeCounter()
}

MacroJSX.prototype.replacePath = function(path) {
  const tokens = this.tokenizeNode(path.node)

  const messageFormat = new ICUMessageFormat()
  const { message: messageRaw, values, jsxElements } = messageFormat.fromTokens(
    tokens
  )
  const message = normalizeWhitespace(messageRaw)

  const { attributes, id } = this.stripMacroAttributes(path.node)

  if (!id && !message) {
    return
  } else if (id && id !== message) {
    // If `id` prop already exists and generated ID is different,
    // add it as a `default` prop
    attributes.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("id"),
        this.types.StringLiteral(id)
      )
    )
    attributes.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("defaults"),
        this.types.StringLiteral(message)
      )
    )
  } else {
    attributes.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("id"),
        this.types.StringLiteral(message)
      )
    )
  }

  // Parameters for variable substitution
  const valuesObject = Object.keys(values).map(key =>
    this.types.objectProperty(this.types.identifier(key), values[key])
  )

  if (valuesObject.length) {
    attributes.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("values"),
        this.types.JSXExpressionContainer(
          this.types.objectExpression(valuesObject)
        )
      )
    )
  }

  // Inline elements
  if (Object.keys(jsxElements).length) {
    attributes.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("components"),
        this.types.JSXExpressionContainer(
          this.types.objectExpression(
            Object.keys(jsxElements).map(key =>
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

  path.replaceWith(
    this.types.JSXElement(
      this.types.JSXOpeningElement(
        this.types.JSXIdentifier("Trans"),
        attributes,
        /*selfClosing*/ true
      ),
      /*closingElement*/ null,
      /*children*/ [],
      /*selfClosing*/ true
    )
  )
}

MacroJSX.prototype.stripMacroAttributes = function(node) {
  const { attributes } = node.openingElement
  const attrName = (names, exclude = false) => {
    const namesRe = new RegExp("^(" + names.join("|") + ")$")
    return attr =>
      exclude ? !namesRe.test(attr.name.name) : namesRe.test(attr.name.name)
  }
  const id = attributes.filter(attrName(["id"]))[0]
  const defaults = attributes.filter(attrName(["defaults"]))[0]

  let reserved = ["id", "defaults"]
  if (this.isI18nComponent(node)) {
    // no reserved prop names
  } else if (this.isChoiceComponent(node)) {
    reserved = [
      ...reserved,
      "_\\d+",
      "zero",
      "one",
      "few",
      "many",
      "other",
      "value",
      "offset"
    ]
  }

  return {
    id: id != null ? id.value.value : null,
    defaults,
    attributes: attributes.filter(attrName(reserved, true))
  }
}

MacroJSX.prototype.tokenizeNode = function(node) {
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

MacroJSX.prototype.tokenizeTrans = function(node) {
  return node.children.map(child => this.tokenizeChildren(child))
}

MacroJSX.prototype.tokenizeChildren = function(node) {
  if (this.types.isJSXExpressionContainer(node)) {
    const exp = node.expression

    if (this.types.isStringLiteral(exp)) {
      // Escape forced newlines to keep them in message.
      return {
        type: "text",
        value: exp.value.replace(/\n/, "\\n")
      }
    } else if (this.types.isTemplateLiteral(exp)) {
      const tokenize = R.pipe(
        // Don't output tokens without text.
        R.evolve({
          quasis: R.map(text => {
            // Don't output tokens without text.
            const value = text.value.raw
            if (value === "") return null

            return this.tokenizeText(value)
          }),
          expressions: R.map(exp =>
            this.types.isCallExpression(exp)
              ? this.tokenizeNode(exp)
              : this.tokenizeExpression(exp)
          )
        }),
        exp => zip(exp.quasis, exp.expressions),
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
  } else if (this.types.isJSXText(node)) {
    // node.value has HTML entities converted to characters, but we need original
    // HTML entities.
    return this.tokenizeText(node.extra.raw)
  } else {
    // Same as above, but this time node.extra.raw also includes surrounding
    // quotes. We need to strip them first.
    return this.tokenizeText(node.extra.raw.replace(/(["'])(.*)\1/, "$2"))
  }
}

MacroJSX.prototype.tokenizeChoiceComponent = function(node) {
  const element = node.openingElement
  const format = element.name.name.toLowerCase()
  const props = element.attributes

  const token = {
    type: "arg",
    format,
    name: null,
    value: undefined,
    options: {}
  }

  for (const attr of props) {
    const name = attr.name.name

    if (name === "value") {
      const exp = this.types.isLiteral(attr.value)
        ? attr.value
        : attr.value.expression
      token.name = this.expressionToArgument(exp)
      token.value = exp
    } else if (format !== "select" && name === "offset") {
      // offset is static parameter, so it must be either string or number
      token.options.offset = this.types.isStringLiteral(attr.value)
        ? attr.value.value
        : attr.value.expression.value
    } else if (pluralRuleRe.test(name)) {
      let value
      if (this.types.isStringLiteral(attr.value)) {
        value = attr.value.extra.raw.replace(/(["'])(.*)\1/, "$2")
      } else {
        value = this.tokenizeChildren(attr.value)
      }
      token.options[jsx2icuExactChoice(name)] = value
    }
  }

  return token
}

MacroJSX.prototype.tokenizeElement = function(node) {
  const children = node.children.map(child => this.tokenizeChildren(child))

  node.children = []
  node.openingElement.selfClosing = true

  return {
    type: "element",
    name: this._elementIndex(),
    value: node,
    children
  }
}

MacroJSX.prototype.tokenizeExpression = function(node) {
  return {
    type: "arg",
    name: this.expressionToArgument(node),
    value: node
  }
}

MacroJSX.prototype.tokenizeText = function(value) {
  return {
    type: "text",
    value
  }
}

MacroJSX.prototype.expressionToArgument = function(exp) {
  return this.types.isIdentifier(exp) ? exp.name : this._expressionIndex()
}

/**
 * Custom matchers
 */

MacroJSX.prototype.isIdentifier = function(node, name) {
  return this.types.isIdentifier(node, { name })
}

MacroJSX.prototype.isI18nComponent = function(node, name = "Trans") {
  return (
    this.types.isJSXElement(node) &&
    this.types.isJSXIdentifier(node.openingElement.name, {
      name
    })
  )
}

MacroJSX.prototype.isChoiceComponent = function(node) {
  return (
    this.isI18nComponent(node, "Plural") ||
    this.isI18nComponent(node, "Select") ||
    this.isI18nComponent(node, "SelectOrdinal")
  )
}

/**
 * Custom zip method which takes length of the larger array
 * (usually zip functions use the `smaller` length, discarding values in larger array)
 */
function zip(a = [], b = []) {
  return R.range(0, Math.max(a.length, b.length)).map(index => [
    a[index],
    b[index]
  ])
}
