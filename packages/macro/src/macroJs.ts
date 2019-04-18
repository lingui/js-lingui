import * as R from "ramda"
import * as babelTypes from "@babel/types"
import { NodePath } from "@babel/traverse"

import ICUMessageFormat from "./icu"
import { zip, makeCounter } from "./utils"
import { ID, COMMENT, MESSAGE } from "./constants"

const keepSpaceRe = /(?:\\(?:\r\n|\r|\n))+\s+/g
const keepNewLineRe = /(?:\r\n|\r|\n)+\s+/g

function normalizeWhitespace(text) {
  return text
    .replace(keepSpaceRe, " ")
    .replace(keepNewLineRe, "\n")
    .trim()
}

export default class MacroJs {
  types: typeof babelTypes
  _expressionIndex: () => Number

  constructor({ types }) {
    this.types = types
    this._expressionIndex = makeCounter()
  }

  replacePath = (path: NodePath) => {
    const tokens = this.tokenizeNode(path.node)

    const messageFormat = new ICUMessageFormat()
    const {
      message: messageRaw,
      values,
      id,
      comment
    } = messageFormat.fromTokens(tokens)
    const message = normalizeWhitespace(messageRaw)

    const args = []

    if (id) {
      args.push(
        this.types.objectProperty(
          this.types.identifier(ID),
          this.types.stringLiteral(id)
        )
      )

      if (process.env.NODE_ENV !== "production") {
        args.push(
          this.types.objectProperty(
            this.types.identifier(MESSAGE),
            this.types.stringLiteral(message)
          )
        )
      }
    } else {
      args.push(
        this.types.objectProperty(
          this.types.identifier(ID),
          this.types.stringLiteral(message)
        )
      )
    }

    const valuesObject = Object.keys(values).map(key =>
      this.types.objectProperty(this.types.identifier(key), values[key])
    )
    if (valuesObject.length) {
      args.push(
        this.types.objectProperty(
          this.types.identifier("values"),
          this.types.objectExpression(valuesObject)
        )
      )
    }

    if (process.env.NODE_ENV !== "production") {
      if (comment) {
        args.push(
          this.types.objectProperty(
            this.types.identifier(COMMENT),
            this.types.stringLiteral(comment)
          )
        )
      }
    }

    path.replaceWith(this.types.objectExpression(args))
  }

  tokenizeNode = node => {
    if (this.isI18nMethod(node)) {
      // t
      return this.tokenizeTemplateLiteral(node)
    } else if (this.isChoiceMethod(node)) {
      // plural, select and selectOrdinal
      return [this.tokenizeChoiceComponent(node)]
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
  tokenizeTemplateLiteral = (node: babelTypes.Expression) => {
    const tokenize = R.pipe(
      R.evolve({
        quasis: R.map((text: babelTypes.TemplateElement) => {
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

  tokenizeChoiceComponent = node => {
    const format = node.callee.name.toLowerCase()

    const value = node.arguments[0]
    const name = this.expressionToArgument(value)

    const token = {
      type: "arg",
      format,
      name,
      value,
      options: {
        offset: undefined
      }
    }

    const props = node.arguments[1].properties

    for (const attr of props) {
      const { key } = attr

      // name is either:
      // NumericLiteral => convert to `={number}`
      // StringLiteral => key.value
      // Literal => key.name
      const name = this.types.isNumericLiteral(key)
        ? `=${key.value}`
        : key.name || key.value

      if (format !== "select" && name === "offset") {
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

  tokenizeExpression = node => {
    return {
      type: "arg",
      name: this.expressionToArgument(node),
      value: node
    }
  }

  expressionToArgument = exp => {
    return this.types.isIdentifier(exp) ? exp.name : this._expressionIndex()
  }

  /**
   * Custom matchers
   */

  isIdentifier = (node, name) => {
    return this.types.isIdentifier(node, { name })
  }

  isI18nMethod = node => {
    return (
      this.isIdentifier(node.tag, "t") ||
      (this.types.isCallExpression(node.tag) &&
        this.isIdentifier(node.tag.callee, "t"))
    )
  }

  isChoiceMethod = node => {
    return (
      this.types.isCallExpression(node) &&
      (this.isIdentifier(node.callee, "plural") ||
        this.isIdentifier(node.callee, "select") ||
        this.isIdentifier(node.callee, "selectOrdinal"))
    )
  }
}
