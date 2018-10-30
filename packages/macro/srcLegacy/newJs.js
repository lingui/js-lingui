import * as R from "ramda"

export default function Macro({ types }) {
  this.t = types
}

Macro.prototype.replaceNode = function(node) {
  const tokens = this.tokenizeNode(node)
  const {
    id,
    defaults,
    comment,
    values,
    formats
  } = messageFormat(tokens)
  const
}

Macro.prototype.tokenizeNode = function(node) {
  if (this.isI18nMethod(node)) {
    // t
    return this.tokenizeTemplateLiteral(node)
  } else if (this.isChoiceMethod(node.callee)) {
    // plural, select and selectOrdinal
    return this.tokenizeChoiceMethod(node)
    // } else if (isFormatMethod(node.callee)) {
    //   // date, number
    //   return transformFormatMethod(node, file, props, root)
  }

  console.error(node)
  throw new Error("Unknown node type")
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
        const value = text.value.raw
        if (value === "") return null

        return {
          type: "text",
          value
        }
      }),
      expressions: R.map(
        exp =>
          this.t.isCallExpression(exp)
            ? this.tokenizeNode(exp)
            : {
                type: "arg",
                name: this.expressionToArgument(exp),
                value: exp
              }
      )
    }),
    exp => zip(exp.quasis, exp.expressions),
    R.flatten,
    R.filter(Boolean)
  )

  return tokenize(node)
}

Macro.prototype.tokenizeChoiceMethod = function(node) {
  const type = node.callee.property.name.toLowerCase()
  const props = node.arguments[0].properties

  const token = {
    type: "arg",
    format: type,
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
    const name = this.t.isNumericLiteral(key)
      ? `=${key.value}`
      : key.name || key.value

    if (name === "value") {
      const exp = attr.value
      token.name = this.expressionToArgument(exp)
      token.value = exp
    } else if (type !== "select" && name === "offset") {
      token.options.offset = attr.value.value
    } else {
      let value

      if (this.t.isTemplateLiteral(attr.value)) {
        value = this.tokenizeTemplateLiteral(attr.value)
      } else if (this.t.isCallExpression(attr.value)) {
        value = this.tokenizeNode(attr.value)
      } else {
        value = attr.value.value
      }
      token.options[name] = value
    }
  }

  return token
}

Macro.prototype.expressionToArgument = function(exp) {
  return this.t.isIdentifier(exp) ? exp.name : null
}

/**
 * Custom matchers
 */

Macro.prototype.isIdentifier = function(node, name) {
  return this.t.isIdentifier(node, { name })
}

Macro.prototype.isI18nMethod = function(node) {
  return (
    this.isIdentifier(node.tag, "t") ||
    (this.t.isCallExpression(node.tag) &&
      this.isIdentifier(node.tag.callee, "t"))
  )
}

Macro.prototype.isChoiceMethod = function(node) {
  return (
    this.t.isMemberExpression(node) &&
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
 */
function zip(a, b) {
  const rv = []
  const len = Math.max(a.length, b.length)
  let idx = 0
  while (idx < len) {
    rv[idx] = [a[idx], b[idx]]
    idx += 1
  }
  return rv
}
