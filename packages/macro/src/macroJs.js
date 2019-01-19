import * as R from "ramda"
import ICUMessageFormat from "./icu"

const generatorFactory = (index = 0) => () => index++

export default function Macro({ types }) {
  this.types = types
  this._expressionIndex = generatorFactory()
}

Macro.prototype.replaceNode = function(path) {
  const tokens = this.tokenizeNode(path.node)

  const messageFormat = new ICUMessageFormat()
  const { message, values, id, comment } = messageFormat.fromTokens(tokens)

  const args = []
  const meta = []

  if (id) {
    args.push(this.types.stringLiteral(id))
    meta.push(
      this.types.objectProperty(
        this.types.identifier("defaults"),
        this.types.stringLiteral(message)
      )
    )
  } else {
    args.push(this.types.stringLiteral(message))
  }

  const valuesObject = Object.keys(values).map(key =>
    this.types.objectProperty(this.types.identifier(key), values[key])
  )
  if (valuesObject.length) {
    args.push(this.types.objectExpression(valuesObject))
  }

  if (comment) {
    meta.push(
      this.types.objectProperty(
        this.types.identifier("comment"),
        this.types.stringLiteral(comment)
      )
    )
  }

  if (meta.length) {
    args.push(this.types.objectExpression(meta))
  }

  path.replaceWith(
    this.types.callExpression(
      this.types.memberExpression(
        this.types.identifier("i18n"),
        this.types.identifier("_")
      ),
      args
    )
  )
}

Macro.prototype.tokenizeNode = function(node) {
  if (this.isI18nMethod(node)) {
    // t
    return this.tokenizeTemplateLiteral(node)
  } else if (this.isChoiceMethod(node.callee)) {
    // plural, select and selectOrdinal
    return [this.tokenizeChoiceMethod(node)]
    // } else if (isFormatMethod(node.callee)) {
    //   // date, number
    //   return transformFormatMethod(node, file, props, root)
  } else {
    return this.tokenizeExpression(node)
  }
}

/**
 * `node` is a TemplateLiteral. node.quasi contains
 * text chunks and node.expressions contains expressions.
 * Both arrays must be zipped together to get the final list of tokens.
 */
Macro.prototype.tokenizeTemplateLiteral = function(node) {
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

  return tokenize(
    this.types.isTaggedTemplateExpression(node) ? node.quasi : node
  )
}

Macro.prototype.tokenizeChoiceMethod = function(node) {
  const format = node.callee.property.name.toLowerCase()
  const props = node.arguments[0].properties

  const token = {
    type: "arg",
    format,
    name: null,
    value: undefined,
    options: {}
  }

  for (const attr of props) {
    const { key } = attr

    // name is either:
    // NumericLiteral => convert to `={number}`
    // StringLiteral => key.value
    // Literal => key.name
    const name = this.types.isNumericLiteral(key)
      ? `=${key.value}`
      : key.name || key.value

    if (name === "value") {
      const exp = attr.value
      token.name = this.expressionToArgument(exp)
      token.value = exp
    } else if (format !== "select" && name === "offset") {
      token.options.offset = attr.value.value
    } else {
      let value

      if (this.types.isTemplateLiteral(attr.value)) {
        value = this.tokenizeTemplateLiteral(attr.value)
      } else if (this.types.isCallExpression(attr.value)) {
        value = this.tokenizeNode(attr.value)
      } else {
        value = attr.value.value
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

Macro.prototype.isI18nMethod = function(node) {
  return (
    this.isIdentifier(node.tag, "t") ||
    (this.types.isCallExpression(node.tag) &&
      this.isIdentifier(node.tag.callee, "t"))
  )
}

Macro.prototype.isChoiceMethod = function(node) {
  return (
    this.types.isMemberExpression(node) &&
    this.isIdentifier(node.object, "t") &&
    (this.isIdentifier(node.property, "plural") ||
      this.isIdentifier(node.property, "select") ||
      this.isIdentifier(node.property, "selectOrdinal"))
  )
}

Macro.prototype.isFormatMethod = function(node) {
  return this.isIdentifier(node, "date") || this.isIdentifier(node, "number")
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
