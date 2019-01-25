import * as R from "ramda"
import ICUMessageFormat from "./icu"

const jsx2icuExactChoice = value => value.replace(/_(\d+)/, "=$1")

const generatorFactory = (index = 0) => () => index++

export default function Macro({ types }) {
  this.types = types
  this._expressionIndex = generatorFactory()
}

Macro.prototype.replaceNode = function(path) {
  const { node } = path
  const tokens = this.tokenizeNode(node)

  const messageFormat = new ICUMessageFormat()
  const {
    message,
    values,
    id,
    comment,
    jsxElements
  } = messageFormat.fromTokens(tokens)

  // Cleanup children
  node.children = []
  node.openingElement.selfClosing = true

  let attrs = node.openingElement.attributes

  // If `id` prop already exists and generated ID is different,
  // add it as a `default` prop
  const idAttr = attrs.filter(this.isIdAttribute.bind(this))[0]
  if (idAttr && message && idAttr.value.value !== message) {
    attrs.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("defaults"),
        this.types.StringLiteral(message)
      )
    )
  } else if (!idAttr) {
    attrs.push(
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
    attrs.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("values"),
        this.types.JSXExpressionContainer(
          this.types.objectExpression(valuesObject)
        )
      )
    )
  }

  // Inline elements
  if (false && jsxElements.length) {
    attrs.push(
      this.types.JSXAttribute(
        this.types.JSXIdentifier("components"),
        this.types.JSXExpressionContainer(
          this.types.arrayExpression(props.components)
        )
      )
    )
  }
}

Macro.prototype.tokenizeNode = function(node) {
  if (this.isI18nComponent(node)) {
    // t
    return this.tokenizeTrans(node)
  } else if (this.isChoiceComponent(node)) {
    // plural, select and selectOrdinal
    return this.tokenizeChoiceComponent(node)
    // } else if (isFormatMethod(node.callee)) {
    //   // date, number
    //   return transformFormatMethod(node, file, props, root)
  } else {
    return this.tokenizeExpression(node)
  }
}

Macro.prototype.tokenizeTrans = function(node) {
  return node.children.map(child => this.tokenizeChildren(child))
}

Macro.prototype.tokenizeChildren = function(node) {
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
        R.evolve({
          quasis: R.map(text => {
            // Don't output tokens without text.
            const value = text.value.raw
            if (value === "") return null

            return {
              type: "text",
              value
            }
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
    return {
      type: "text",
      value: node.extra.raw
    }
  } else {
    // Same as above, but this time node.extra.raw also includes surrounding
    // quotes. We need to strip them first.
    return {
      type: "text",
      value: node.extra.raw.replace(/(["'])(.*)\1/, "$2")
    }
  }
}

Macro.prototype.tokenizeChoiceComponent = function(node) {
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
    const name = jsx2icuExactChoice(attr.name.name)

    if (name === "value") {
      const exp = this.types.isLiteral(attr.value)
        ? attr.value
        : attr.value.expression
      token.name = this.expressionToArgument(exp)
      token.value = exp
    } else if (format !== "select" && name === "offset") {
      // offset is static parameter, so it must be either string or number
      token.options.offset = this.types.isStringLiteral(attr.value)
        ? attr.value
        : attr.value.expression.value
    } else {
      let value
      if (this.types.isStringLiteral(attr.value)) {
        value = attr.value.extra.raw.replace(/(["'])(.*)\1/, "$2")
      } else {
        value = this.tokenizeChildren(attr.value)
      }
      token.options[name] = value
    }
  }

  return token
}

Macro.prototype.tokenizeExpression = function(node) {
  return {
    type: "arg",
    name: this.expressionToArgument(node),
    value: node
  }
}

Macro.prototype.expressionToArgument = function(exp) {
  return this.types.isIdentifier(exp) ? exp.name : this._expressionIndex()
}

/**
 * Custom matchers
 */

Macro.prototype.isIdentifier = function(node, name) {
  return this.types.isIdentifier(node, { name })
}

Macro.prototype.isI18nComponent = function(node, name = "Trans") {
  return (
    this.types.isJSXElement(node) &&
    this.types.isJSXIdentifier(node.openingElement.name, {
      name
    })
  )
}

Macro.prototype.isChoiceComponent = function(node) {
  return (
    this.isI18nComponent(node, "Plural") ||
    this.isI18nComponent(node, "Select") ||
    this.isI18nComponent(node, "SelectOrdinal")
  )
}

Macro.prototype.isIdAttribute = function(node) {
  return (
    this.types.isJSXAttribute(node) &&
    this.types.isJSXIdentifier(node.name, { name: "id" })
  )
}
Macro.prototype.isDefaultsAttribute = function(node) {
  return (
    this.types.isJSXAttribute(node) &&
    this.types.isJSXIdentifier(node.name, { name: "defaults" })
  )
}

Macro.prototype.isDescriptionAttribute = function(node) {
  return (
    this.types.isJSXAttribute(node) &&
    this.types.isJSXIdentifier(node.name, { name: "description" })
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
