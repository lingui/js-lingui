import * as R from "ramda"
import * as babelTypes from "@babel/types"
import { NodePath } from "@babel/traverse"

import ICUMessageFormat from "./icu"
import { zip, makeCounter } from "./utils"
import { COMMENT, ID, MESSAGE, EXTRACT_MARK } from "./constants"

const keepSpaceRe = /(?:\\(?:\r\n|\r|\n))+\s+/g
const keepNewLineRe = /(?:\r\n|\r|\n)+\s+/g
const removeExtraScapedLiterals = /(?:\\(.))/g

function normalizeWhitespace(text) {
  return text.replace(keepSpaceRe, " ").replace(keepNewLineRe, "\n").trim()
}

export default class MacroJs {
  // Babel Types
  types: typeof babelTypes

  // Identifier of i18n object
  i18nImportName: string

  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  _expressionIndex: () => Number

  constructor({ types }, { i18nImportName }) {
    this.types = types
    this.i18nImportName = i18nImportName
    this._expressionIndex = makeCounter()
  }

  replacePathWithMessage = (
    path: NodePath,
    { id, message, values, comment }
  ) => {
    const args = []
    const options = []

    const messageNode = isString(message)
      ? this.types.stringLiteral(message)
      : message

    if (id) {
      args.push(this.types.stringLiteral(id))

      if (process.env.NODE_ENV !== "production") {
        options.push(
          this.types.objectProperty(this.types.identifier(MESSAGE), messageNode)
        )
      }
    } else {
      args.push(messageNode)
    }

    if (comment) {
      options.push(
        this.types.objectProperty(
          this.types.identifier(COMMENT),
          this.types.stringLiteral(comment)
        )
      )
    }

    if (Object.keys(values).length || options.length) {
      const valuesObject = Object.keys(values).map((key) =>
        this.types.objectProperty(this.types.identifier(key), values[key])
      )

      args.push(this.types.objectExpression(valuesObject))
    }

    if (options.length) {
      args.push(this.types.objectExpression(options))
    }

    const newNode = this.types.callExpression(
      this.types.memberExpression(
        this.types.identifier(this.i18nImportName),
        this.types.identifier("_")
      ),
      args
    )

    // preserve line number
    newNode.loc = path.node.loc

    path.addComment("leading", EXTRACT_MARK)
    // @ts-ignore
    path.replaceWith(newNode)
  }

  replacePath = (path: NodePath) => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    if (this.isDefineMessage(path.node)) {
      this.replaceDefineMessage(path)
      return
    }

    if (
      this.types.isCallExpression(path.node) &&
      this.isIdentifier(path.node.callee, "t")
    ) {
      this.replaceTAsFunction(path)
      return
    }

    const tokens = this.tokenizeNode(path.node)

    const messageFormat = new ICUMessageFormat()
    const {
      message: messageRaw,
      values,
      id,
      comment,
    } = messageFormat.fromTokens(tokens)
    const message = normalizeWhitespace(messageRaw)

    this.replacePathWithMessage(path, { id, message, values, comment })
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
   *   message: plural(value, { one: "book", other: "books" })
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
  replaceDefineMessage = (path) => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    const descriptor = this.processDescriptor(path.node.arguments[0])
    path.replaceWith(descriptor)
  }

  /**
   * macro `t` is called with MessageDescriptor, after that
   * we create a new node to append it to i18n._
   */
  replaceTAsFunction = (path) => {
    const descriptor = this.processDescriptor(path.node.arguments[0])
    const newNode = this.types.callExpression(
      this.types.memberExpression(
        this.types.identifier(this.i18nImportName),
        this.types.identifier("_")
      ),
      [descriptor]
    )
    path.replaceWith(newNode)
  }

  /**
   * `processDescriptor` expand macros inside messsage descriptor.
   * Message descriptor is used in `defineMessage`.
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
  processDescriptor = (descriptor) => {
    this.types.addComment(descriptor, "leading", EXTRACT_MARK)
    const messageIndex = descriptor.properties.findIndex(
      (property) => property.key.name === MESSAGE
    )
    if (messageIndex === -1) {
      return descriptor
    }

    // if there's `message` property, replace macros with formatted message
    const node = descriptor.properties[messageIndex]

    // Inside message descriptor the `t` macro in `message` prop is optional.
    // Template strings are always processed as if they were wrapped by `t`.
    const tokens = this.types.isTemplateLiteral(node.value)
      ? this.tokenizeTemplateLiteral(node.value)
      : this.tokenizeNode(node.value, true)

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
      descriptor.properties.findIndex(
        (property) => property.key.name === ID
      ) !== -1

    descriptor.properties[messageIndex] = this.types.objectProperty(
      this.types.identifier(hasId ? MESSAGE : ID),
      messageNode
    )

    return descriptor
  }

  addValues = (obj, values) => {
    const valuesObject = Object.keys(values).map((key) =>
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
            value: this.clearBackslashes(value),
          }
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

    return tokenize(
      this.types.isTaggedTemplateExpression(node) ? node.quasi : node
    )
  }

  tokenizeChoiceComponent = (node) => {
    const format = node.callee.name.toLowerCase()

    const token = {
      ...this.tokenizeExpression(node.arguments[0]),
      format,
      options: {
        offset: undefined,
      },
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

  tokenizeExpression = (node) => {
    if (this.isArg(node)) {
      return {
        type: "arg",
        name: node.arguments[0].value,
      }
    }
    return {
      type: "arg",
      name: this.expressionToArgument(node),
      value: node,
    }
  }

  expressionToArgument = (exp) => {
    if (this.types.isIdentifier(exp)) {
      return exp.name
    } else if (this.types.isStringLiteral(exp)) {
      return exp.value
    } else {
      return this._expressionIndex()
    }
  }

  /**
   * We clean '//\` ' to just '`'
   */
  clearBackslashes(value: string) {
    // it's an unicode char so we should keep them
    if (value.includes('\\u')) return value.replace(removeExtraScapedLiterals, "\/u")
    // if not we replace the extra scaped literals
    return value.replace(removeExtraScapedLiterals, "`")
  }

  /**
   * Custom matchers
   */

  isIdentifier = (node, name) => {
    return this.types.isIdentifier(node, { name })
  }

  isDefineMessage = (node) => {
    return (
      this.types.isCallExpression(node) &&
      this.isIdentifier(node.callee, "defineMessage")
    )
  }

  isArg = (node) => {
    return (
      this.types.isCallExpression(node) && this.isIdentifier(node.callee, "arg")
    )
  }

  isI18nMethod = (node) => {
    return (
      this.isIdentifier(node.tag, "t") ||
      (this.types.isCallExpression(node.tag) &&
        this.isIdentifier(node.tag.callee, "t"))
    )
  }

  isChoiceMethod = (node) => {
    return (
      this.types.isCallExpression(node) &&
      (this.isIdentifier(node.callee, "plural") ||
        this.isIdentifier(node.callee, "select") ||
        this.isIdentifier(node.callee, "selectOrdinal"))
    )
  }
}

const isString = (s): s is string => typeof s === "string"
