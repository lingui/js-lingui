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
    if (this.isDefineMessages(path.node)) {
      this.replaceDefineMessages(path)
      return
    }

    if (this.isDefineMessage(path.node)) {
      this.replaceDefineMessage(path)
      return
    }

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

    this.addValues(args, values)

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

    const newNode = this.types.objectExpression(args)
    // preserve line number
    newNode.loc = path.node.loc

    this.addExtractMark(path)
    path.replaceWith(newNode)
  }

  /**
   * macro `defineMessage` is called with MessageDescriptor. The only
   * thing that happens is that any macros used in `message` property
   * are replaced with formatted message.
   *
   * import { defineMessage, plural } from '@lingui/macro';
   * const message = defineMessage({
   *   id: "msg.id",
   *   comment: "Description",
   *   message: plural("value", { one: "book", other: "books" })
   * })
   *
   * ↓ ↓ ↓ ↓ ↓ ↓
   *
   * const message = {
   *   id: "msg.id",
   *   comment: "Description",
   *   message: "{value, plural, one {book} other {books}}"
   * }
   *
   */
  replaceDefineMessage = path => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    // TODO: Add argument validation.
    const descriptor = this.processDescriptor(path.node.arguments[0])
    this.addExtractMark(path)
    path.replaceWith(descriptor)
  }

  replaceDefineMessages = path => {
    const messages = []

    for (const property of path.get("arguments.0.properties")) {
      const { node } = property

      this._expressionIndex = makeCounter()
      if (this.types.isObjectExpression(node.value)) {
        const descriptor = this.processDescriptor(node.value)
        messages.push([node.key, descriptor])
      } else {
        const tokens = this.tokenizeNode(node.value, true)

        let messageNode = node.value
        if (tokens != null) {
          const messageFormat = new ICUMessageFormat()
          const { message: messageRaw, id } = messageFormat.fromTokens(tokens)
          const message = normalizeWhitespace(messageRaw)
          messageNode = this.types.stringLiteral(id || message)
        }

        messages.push([node.key, messageNode])
      }
    }

    path.replaceWith(this.types.objectExpression(
      messages.map(([key, value]) => this.types.objectProperty(key, value))
    ) as any)

    for (const property of path.get("properties")) {
      this.addExtractMark(property.get("value"))
    }
  }

  /**
   * `processDescriptor` expand macros inside messsage descriptor.
   * Message descriptor is used in `defineMessage` and `defineMessages`
   * macros.
   *
   * {
   *   comment: "Description",
   *   message: plural("value", { one: "book", other: "books" })
   * }
   *
   * ↓ ↓ ↓ ↓ ↓ ↓
   *
   * {
   *   comment: "Description",
   *   id: "{value, plural, one {book} other {books}}"
   * }
   *
   */
  processDescriptor = descriptor => {
    const messageIndex = descriptor.properties.findIndex(
      property => property.key.name === MESSAGE
    )
    if (messageIndex === -1) {
      return descriptor
    }

    // if there's `message` property, replace macros with formatted message
    const node = descriptor.properties[messageIndex]
    const tokens = this.tokenizeNode(node.value, true)

    let messageNode = node.value
    if (tokens != null) {
      const messageFormat = new ICUMessageFormat()
      const { message: messageRaw, values } = messageFormat.fromTokens(tokens)
      const message = normalizeWhitespace(messageRaw)
      messageNode = this.types.stringLiteral(message)

      this.addValues(descriptor.properties, values)
    }

    // Don't override custom ID
    const hasId =
      descriptor.properties.findIndex(property => property.key.name === ID) !==
      -1

    descriptor.properties[messageIndex] = this.types.objectProperty(
      this.types.identifier(hasId ? MESSAGE : ID),
      messageNode
    )

    return descriptor
  }

  tokenizeNode = (node, ignoreExpression = false) => {
    if (this.isI18nMethod(node)) {
      // t
      return this.tokenizeTemplateLiteral(node)
    } else if (this.isChoiceMethod(node)) {
      // plural, select and selectOrdinal
      return [this.tokenizeChoiceComponent(node)]
      // } else if (isFormatMethod(node.callee)) {
      //   // date, number
      //   return transformFormatMethod(node, file, props, root)
    } else if (!ignoreExpression) {
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
      (exp: babelTypes.TemplateLiteral) => zip(exp.quasis, exp.expressions),
      R.flatten,
      R.filter(Boolean)
    )

    return tokenize(
      this.types.isTaggedTemplateExpression(node) ? node.quasi : node
    )
  }

  tokenizeChoiceComponent = node => {
    const format = node.callee.name.toLowerCase()

    const token = {
      ...this.tokenizeExpression(node.arguments[0]),
      format,
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
    if (this.isArg(node)) {
      return {
        type: "arg",
        name: node.arguments[0].value
      }
    }
    return {
      type: "arg",
      name: this.expressionToArgument(node),
      value: node
    }
  }

  expressionToArgument = exp => {
    if (this.types.isIdentifier(exp)) {
      return exp.name
    } else if (this.types.isStringLiteral(exp)) {
      return exp.value
    } else {
      return this._expressionIndex()
    }
  }

  addValues = (obj, values) => {
    const valuesObject = Object.keys(values).map(key =>
      this.types.objectProperty(this.types.identifier(key), values[key])
    )

    if (!valuesObject.length) return

    obj.push(
      this.types.objectProperty(
        this.types.identifier("values"),
        this.types.objectExpression(valuesObject)
      )
    )
  }

  /**
   * addExtractMark - add comment which marks the string/object
   * for extraction.
   * @lingui/babel-extract-messages looks for this comment
   *
   * @param path
   */
  addExtractMark = path => {
    path.addComment("leading", "i18n")
  }

  /**
   * Custom matchers
   */

  isIdentifier = (node, name) => {
    return this.types.isIdentifier(node, { name })
  }

  isDefineMessage = node => {
    return (
      this.types.isCallExpression(node) &&
      this.isIdentifier(node.callee, "defineMessage")
    )
  }

  isDefineMessages = node => {
    return (
      this.types.isCallExpression(node) &&
      this.isIdentifier(node.callee, "defineMessages")
    )
  }

  isArg = node => {
    return (
      this.types.isCallExpression(node) && this.isIdentifier(node.callee, "arg")
    )
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
