import { pipe, evolve, map, flatten, filter } from "ramda"

export default function Macro({ types }) {
  this.t = types
}

/**
 * `node` is a TemplateLiteral. node.quasi contains
 * text chunks and node.expressions contains expressions.
 * Both arrays must be zipped together to get the final list of tokens.
 */
Macro.prototype.tokenizeTemplateLiteral = function(node) {
  const tokenize = pipe(
    evolve({
      quasis: map(text => {
        const value = text.value.raw
        if (value === "") return null

        return {
          type: "text",
          value
        }
      }),
      expressions: map(exp => ({
        type: "arg",
        name: this.expressionToArgument(exp),
        value: exp
      }))
    }),
    exp => zip(exp.quasis, exp.expressions),
    flatten,
    filter(Boolean)
  )

  return tokenize(node)
}

Macro.prototype.expressionToArgument = function(exp) {
  return this.t.isIdentifier(exp) ? exp.name : null
}

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
