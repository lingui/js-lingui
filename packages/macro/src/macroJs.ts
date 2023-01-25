import * as R from "ramda"
import * as babelTypes from "@babel/types"
import {
  Expression,
  Node,
  CallExpression,
  ObjectExpression,
  isObjectProperty,
  ObjectProperty,
  Identifier,
  StringLiteral,
} from "@babel/types"
import { NodePath } from "@babel/traverse"

import ICUMessageFormat, {
  ArgToken,
  ParsedResult,
  TextToken,
  Tokens,
} from "./icu"
import { zip, makeCounter } from "./utils"
import { COMMENT, ID, MESSAGE, EXTRACT_MARK } from "./constants"

const keepSpaceRe = /(?:\\(?:\r\n|\r|\n))+\s+/g
const keepNewLineRe = /(?:\r\n|\r|\n)+\s+/g

function normalizeWhitespace(text: string): string {
  return text.replace(keepSpaceRe, " ").replace(keepNewLineRe, "\n").trim()
}

export type MacroJsOpts = {
  i18nImportName: string
  stripNonEssentialProps: boolean
}

export default class MacroJs {
  // Babel Types
  types: typeof babelTypes

  // Identifier of i18n object
  i18nImportName: string
  stripNonEssentialProps: boolean

  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  _expressionIndex = makeCounter()

  constructor({ types }: { types: typeof babelTypes }, opts: MacroJsOpts) {
    this.types = types
    this.i18nImportName = opts.i18nImportName
    this.stripNonEssentialProps = opts.stripNonEssentialProps
  }

  replacePathWithMessage = (
    path: NodePath,
    {
      message,
      values,
    }: { message: ParsedResult["message"]; values: ParsedResult["values"] },
    linguiInstance?: babelTypes.Identifier
  ) => {
    const args = []

    args.push(isString(message) ? this.types.stringLiteral(message) : message)

    if (Object.keys(values).length) {
      const valuesObject = Object.keys(values).map((key) =>
        this.types.objectProperty(this.types.identifier(key), values[key])
      )

      args.push(this.types.objectExpression(valuesObject))
    }

    const newNode = this.types.callExpression(
      this.types.memberExpression(
        linguiInstance ?? this.types.identifier(this.i18nImportName),
        this.types.identifier("_")
      ),
      args
    )

    // preserve line number
    newNode.loc = path.node.loc

    path.addComment("leading", EXTRACT_MARK)
    path.replaceWith(newNode)
  }

  // Returns a boolean indicating if the replacement requires i18n import
  replacePath = (path: NodePath): boolean => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    if (this.isDefineMessage(path.node)) {
      this.replaceDefineMessage(path as NodePath<CallExpression>)
      return true
    }

    // t(i18nInstance)`Message` -> i18nInstance._('Message')
    if (
      this.types.isCallExpression(path.node) &&
      this.types.isTaggedTemplateExpression(path.parentPath.node) &&
      this.types.isIdentifier(path.node.arguments[0]) &&
      this.isIdentifier(path.node.callee, "t")
    ) {
      // Use the first argument as i18n instance instead of the default i18n instance
      const i18nInstance = path.node.arguments[0]
      const tokens = this.tokenizeNode(path.parentPath.node)

      const messageFormat = new ICUMessageFormat()
      const { message: messageRaw, values } = messageFormat.fromTokens(tokens)
      const message = normalizeWhitespace(messageRaw)

      this.replacePathWithMessage(
        path.parentPath,
        { message, values },
        i18nInstance
      )
      return false
    }

    // t(i18nInstance)(messageDescriptor) -> i18nInstance._(messageDescriptor)
    if (
      this.types.isCallExpression(path.node) &&
      this.types.isCallExpression(path.parentPath.node) &&
      this.types.isIdentifier(path.node.arguments[0]) &&
      this.isIdentifier(path.node.callee, "t")
    ) {
      const i18nInstance = path.node.arguments[0]
      this.replaceTAsFunction(
        path.parentPath as NodePath<CallExpression>,
        i18nInstance
      )
      return false
    }

    if (
      this.types.isCallExpression(path.node) &&
      this.isIdentifier(path.node.callee, "t")
    ) {
      this.replaceTAsFunction(path as NodePath<CallExpression>)
      return true
    }

    const tokens = this.tokenizeNode(path.node)

    const messageFormat = new ICUMessageFormat()
    const { message: messageRaw, values } = messageFormat.fromTokens(tokens)
    const message = normalizeWhitespace(messageRaw)

    this.replacePathWithMessage(path, { message, values })

    return true
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
  replaceDefineMessage = (path: NodePath<CallExpression>) => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    let descriptor = this.processDescriptor(path.node.arguments[0])

    path.replaceWith(descriptor)
  }

  /**
   * macro `t` is called with MessageDescriptor, after that
   * we create a new node to append it to i18n._
   */
  replaceTAsFunction = (
    path: NodePath<CallExpression>,
    linguiInstance?: babelTypes.Identifier
  ) => {
    let descriptor = this.processDescriptor(path.node.arguments[0])

    const newNode = this.types.callExpression(
      this.types.memberExpression(
        linguiInstance ?? this.types.identifier(this.i18nImportName),
        this.types.identifier("_")
      ),
      [descriptor]
    )
    path.replaceWith(newNode)
  }

  /**
   * `processDescriptor` expand macros inside message descriptor.
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
  processDescriptor = (descriptor_: Node) => {
    const descriptor = descriptor_ as ObjectExpression

    this.types.addComment(descriptor, "leading", EXTRACT_MARK)
    const messageIndex = descriptor.properties.findIndex(
      (property) =>
        isObjectProperty(property) && this.isIdentifier(property.key, MESSAGE)
    )
    if (messageIndex === -1) {
      return descriptor
    }

    // if there's `message` property, replace macros with formatted message
    const node = descriptor.properties[messageIndex] as ObjectProperty

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
        (property) =>
          isObjectProperty(property) && this.isIdentifier(property.key, ID)
      ) !== -1

    descriptor.properties[messageIndex] = this.types.objectProperty(
      this.types.identifier(hasId ? MESSAGE : ID),
      messageNode
    )

    if (this.stripNonEssentialProps) {
      descriptor.properties = descriptor.properties.filter(
        (property) =>
          isObjectProperty(property) &&
          !this.isIdentifier(property.key, MESSAGE) &&
          isObjectProperty(property) &&
          !this.isIdentifier(property.key, COMMENT)
      )
    }

    return descriptor
  }

  addValues = (
    obj: ObjectExpression["properties"],
    values: ParsedResult["values"]
  ) => {
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

  tokenizeNode = (node: Node, ignoreExpression = false) => {
    if (this.isI18nMethod(node)) {
      // t
      return this.tokenizeTemplateLiteral(node as Expression)
    } else if (this.isChoiceMethod(node)) {
      // plural, select and selectOrdinal
      return [this.tokenizeChoiceComponent(node as CallExpression)]
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
  tokenizeTemplateLiteral = (node: babelTypes.Expression): Tokens => {
    const tokenize = R.pipe(
      R.evolve({
        quasis: R.map((text: babelTypes.TemplateElement): TextToken => {
          // Don't output tokens without text.
          // if it's an unicode we keep the cooked value because it's the parsed value by babel (without unicode chars)
          // This regex will detect if a string contains unicode chars, when they're we should interpolate them
          // why? because platforms like react native doesn't parse them, just doing a JSON.parse makes them UTF-8 friendly
          const value = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g.test(
            text.value.raw
          )
            ? text.value.cooked
            : text.value.raw
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

  tokenizeChoiceComponent = (node: CallExpression): ArgToken => {
    const format = (node.callee as Identifier).name.toLowerCase()

    const token: ArgToken = {
      ...this.tokenizeExpression(node.arguments[0]),
      format,
      options: {
        offset: undefined,
      },
    }

    const props = (node.arguments[1] as ObjectExpression).properties

    for (const attr of props) {
      const { key, value: attrValue } = attr as ObjectProperty

      // name is either:
      // NumericLiteral => convert to `={number}`
      // StringLiteral => key.value
      // Identifier => key.name
      const name = this.types.isNumericLiteral(key)
        ? `=${key.value}`
        : (key as Identifier).name || (key as StringLiteral).value

      if (format !== "select" && name === "offset") {
        token.options.offset = (attrValue as StringLiteral).value
      } else {
        let value: ArgToken["options"][string]

        if (this.types.isTemplateLiteral(attrValue)) {
          value = this.tokenizeTemplateLiteral(attrValue)
        } else if (this.types.isCallExpression(attrValue)) {
          value = this.tokenizeNode(attrValue)
        } else {
          value = (attrValue as StringLiteral).value
        }
        token.options[name] = value
      }
    }

    return token
  }

  tokenizeExpression = (node: Node | Expression): ArgToken => {
    if (this.isArg(node) && this.types.isCallExpression(node)) {
      return {
        type: "arg",
        name: (node.arguments[0] as StringLiteral).value,
        value: undefined,
      }
    }
    return {
      type: "arg",
      name: this.expressionToArgument(node as Expression),
      value: node as Expression,
    }
  }

  expressionToArgument = (exp: Expression): string => {
    if (this.types.isIdentifier(exp)) {
      return exp.name
    } else if (this.types.isStringLiteral(exp)) {
      return exp.value
    } else {
      return String(this._expressionIndex())
    }
  }

  /**
   * We clean '//\` ' to just '`'
   */
  clearBackslashes(value: string) {
    // if not we replace the extra scaped literals
    return value.replace(/\\`/g, "`")
  }

  /**
   * Custom matchers
   */
  isIdentifier = (node: Node | Expression, name: string) => {
    return this.types.isIdentifier(node, { name })
  }

  isDefineMessage = (node: Node): boolean => {
    return (
      this.types.isCallExpression(node) &&
      this.isIdentifier(node.callee, "defineMessage")
    )
  }

  isArg = (node: Node) => {
    return (
      this.types.isCallExpression(node) && this.isIdentifier(node.callee, "arg")
    )
  }

  isI18nMethod = (node: Node) => {
    return (
      this.types.isTaggedTemplateExpression(node) &&
      (this.isIdentifier(node.tag, "t") ||
        (this.types.isCallExpression(node.tag) &&
          this.isIdentifier(node.tag.callee, "t")))
    )
  }

  isChoiceMethod = (node: Node) => {
    return (
      this.types.isCallExpression(node) &&
      (this.isIdentifier(node.callee, "plural") ||
        this.isIdentifier(node.callee, "select") ||
        this.isIdentifier(node.callee, "selectOrdinal"))
    )
  }
}

const isString = (s: unknown): s is string => typeof s === "string"
