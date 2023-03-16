import * as babelTypes from "@babel/types"
import {
  CallExpression,
  Expression,
  Identifier,
  isObjectProperty,
  Node,
  ObjectExpression,
  ObjectProperty,
  SourceLocation,
  StringLiteral,
  TemplateLiteral,
} from "@babel/types"
import { NodePath } from "@babel/traverse"

import ICUMessageFormat, {
  ArgToken,
  ParsedResult,
  TextToken,
  Token,
  Tokens,
} from "./icu"
import { makeCounter } from "./utils"
import { COMMENT, CONTEXT, EXTRACT_MARK, ID, MESSAGE } from "./constants"
import { generateMessageId } from "@lingui/cli/api"

const keepSpaceRe = /(?:\\(?:\r\n|\r|\n))+\s+/g
const keepNewLineRe = /(?:\r\n|\r|\n)+\s+/g

function normalizeWhitespace(text: string): string {
  return text.replace(keepSpaceRe, " ").replace(keepNewLineRe, "\n").trim()
}

function buildICUFromTokens(tokens: Tokens) {
  const messageFormat = new ICUMessageFormat()
  const { message, values } = messageFormat.fromTokens(tokens)

  return { message: normalizeWhitespace(message), values }
}

export type MacroJsOpts = {
  i18nImportName: string
  stripNonEssentialProps: boolean
  nameMap: Map<string, string>
}

export default class MacroJs {
  // Babel Types
  types: typeof babelTypes

  // Identifier of i18n object
  i18nImportName: string
  stripNonEssentialProps: boolean
  nameMap: Map<string, string>
  nameMapReversed: Map<string, string>

  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  _expressionIndex = makeCounter()

  constructor({ types }: { types: typeof babelTypes }, opts: MacroJsOpts) {
    this.types = types
    this.i18nImportName = opts.i18nImportName
    this.stripNonEssentialProps = opts.stripNonEssentialProps
    this.nameMap = opts.nameMap
    this.nameMapReversed = Array.from(opts.nameMap.entries()).reduce(
      (map, [key, value]) => map.set(value, key),
      new Map()
    )
  }

  replacePathWithMessage = (
    path: NodePath,
    tokens: Tokens,
    linguiInstance?: babelTypes.Expression
  ) => {
    const newNode = this.createI18nCall(
      this.createMessageDescriptorFromTokens(tokens, path.node.loc),
      linguiInstance
    )

    path.replaceWith(newNode)
  }

  // Returns a boolean indicating if the replacement requires i18n import
  replacePath = (path: NodePath): boolean => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    // defineMessage({ message: "Message", context: "My" }) -> {id: <hash + context>, message: "Message"}
    if (
      this.types.isCallExpression(path.node) &&
      this.isDefineMessage(path.node.callee)
    ) {
      let descriptor = this.processDescriptor(path.node.arguments[0])
      path.replaceWith(descriptor)
      return false
    }

    // defineMessage`Message` -> {id: <hash>, message: "Message"}
    if (
      this.types.isTaggedTemplateExpression(path.node) &&
      this.isDefineMessage(path.node.tag)
    ) {
      const tokens = this.tokenizeTemplateLiteral(path.node.quasi)
      const descriptor = this.createMessageDescriptorFromTokens(
        tokens,
        path.node.loc
      )

      path.replaceWith(descriptor)
      return false
    }

    // t(i18nInstance)`Message` -> i18nInstance._(messageDescriptor)
    if (
      this.types.isCallExpression(path.node) &&
      this.types.isTaggedTemplateExpression(path.parentPath.node) &&
      this.types.isExpression(path.node.arguments[0]) &&
      this.isLinguiIdentifier(path.node.callee, "t")
    ) {
      // Use the first argument as i18n instance instead of the default i18n instance
      const i18nInstance = path.node.arguments[0]
      const tokens = this.tokenizeNode(path.parentPath.node)

      this.replacePathWithMessage(path.parentPath, tokens, i18nInstance)
      return false
    }

    // t(i18nInstance)(messageDescriptor) -> i18nInstance._(messageDescriptor)
    if (
      this.types.isCallExpression(path.node) &&
      this.types.isCallExpression(path.parentPath.node) &&
      this.types.isExpression(path.node.arguments[0]) &&
      path.parentPath.node.callee === path.node &&
      this.isLinguiIdentifier(path.node.callee, "t")
    ) {
      const i18nInstance = path.node.arguments[0]
      this.replaceTAsFunction(
        path.parentPath as NodePath<CallExpression>,
        i18nInstance
      )
      return false
    }

    // t({...})
    if (
      this.types.isCallExpression(path.node) &&
      this.isLinguiIdentifier(path.node.callee, "t")
    ) {
      this.replaceTAsFunction(path as NodePath<CallExpression>)
      return true
    }

    const tokens = this.tokenizeNode(path.node)

    this.replacePathWithMessage(path, tokens)

    return true
  }

  /**
   * macro `t` is called with MessageDescriptor, after that
   * we create a new node to append it to i18n._
   */
  replaceTAsFunction = (
    path: NodePath<CallExpression>,
    linguiInstance?: babelTypes.Expression
  ) => {
    const descriptor = this.processDescriptor(path.node.arguments[0])
    path.replaceWith(this.createI18nCall(descriptor, linguiInstance))
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
   *   id: <hash>
   *   message: "{value, plural, one {book} other {books}}"
   * }
   *
   */
  processDescriptor = (descriptor_: Node) => {
    const descriptor = descriptor_ as ObjectExpression

    const messageProperty = this.getObjectPropertyByKey(descriptor, MESSAGE)
    const idProperty = this.getObjectPropertyByKey(descriptor, ID)
    const contextProperty = this.getObjectPropertyByKey(descriptor, CONTEXT)

    const properties: ObjectProperty[] = [idProperty]

    if (!this.stripNonEssentialProps) {
      properties.push(contextProperty)
    }

    // if there's `message` property, replace macros with formatted message
    if (messageProperty) {
      // Inside message descriptor the `t` macro in `message` prop is optional.
      // Template strings are always processed as if they were wrapped by `t`.
      const tokens = this.types.isTemplateLiteral(messageProperty.value)
        ? this.tokenizeTemplateLiteral(messageProperty.value)
        : this.tokenizeNode(messageProperty.value, true)

      let messageNode = messageProperty.value as StringLiteral

      if (tokens) {
        const { message, values } = buildICUFromTokens(tokens)
        messageNode = this.types.stringLiteral(message)

        properties.push(this.createValuesProperty(values))
      }

      if (!this.stripNonEssentialProps) {
        properties.push(
          this.createObjectProperty(MESSAGE, messageNode as Expression)
        )
      }

      if (!idProperty && this.types.isStringLiteral(messageNode)) {
        const context =
          contextProperty &&
          this.getTextFromExpression(contextProperty.value as Expression)

        properties.push(this.createIdProperty(messageNode.value, context))
      }
    }

    if (!this.stripNonEssentialProps) {
      properties.push(this.getObjectPropertyByKey(descriptor, COMMENT))
    }

    return this.createMessageDescriptor(properties, descriptor.loc)
  }

  createIdProperty(message: string, context?: string) {
    return this.createObjectProperty(
      ID,
      this.types.stringLiteral(generateMessageId(message, context))
    )
  }

  createValuesProperty(values: ParsedResult["values"]) {
    const valuesObject = Object.keys(values).map((key) =>
      this.types.objectProperty(this.types.identifier(key), values[key])
    )

    if (!valuesObject.length) return

    return this.types.objectProperty(
      this.types.identifier("values"),
      this.types.objectExpression(valuesObject)
    )
  }

  tokenizeNode(node: Node, ignoreExpression = false): Token[] {
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
      return [this.tokenizeExpression(node)]
    }
  }

  /**
   * `node` is a TemplateLiteral. node.quasi contains
   * text chunks and node.expressions contains expressions.
   * Both arrays must be zipped together to get the final list of tokens.
   */
  tokenizeTemplateLiteral(node: babelTypes.Expression): Token[] {
    const tpl = this.types.isTaggedTemplateExpression(node)
      ? node.quasi
      : (node as TemplateLiteral)

    const expressions = tpl.expressions as Expression[]

    return tpl.quasis.flatMap((text, i) => {
      // if it's an unicode we keep the cooked value because it's the parsed value by babel (without unicode chars)
      // This regex will detect if a string contains unicode chars, when they're we should interpolate them
      // why? because platforms like react native doesn't parse them, just doing a JSON.parse makes them UTF-8 friendly
      const value = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g.test(text.value.raw)
        ? text.value.cooked
        : text.value.raw

      let argTokens: Token[] = []
      const currExp = expressions[i]

      if (currExp) {
        argTokens = this.types.isCallExpression(currExp)
          ? this.tokenizeNode(currExp)
          : [this.tokenizeExpression(currExp)]
      }

      return [
        ...(value
          ? [
              {
                type: "text",
                value: this.clearBackslashes(value),
              } as TextToken,
            ]
          : []),
        ...argTokens,
      ]
    })
  }

  tokenizeChoiceComponent(node: CallExpression): ArgToken {
    const name = (node.callee as Identifier).name
    const format = (this.nameMapReversed.get(name) || name).toLowerCase()

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
        } else if (this.types.isStringLiteral(attrValue)) {
          value = attrValue.value
        } else if (this.types.isExpression(attrValue)) {
          value = this.tokenizeExpression(attrValue)
        } else {
          value = (attrValue as unknown as StringLiteral).value
        }
        token.options[name] = value
      }
    }

    return token
  }

  tokenizeExpression(node: Node | Expression): ArgToken {
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

  expressionToArgument(exp: Expression): string {
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

  createI18nCall(
    messageDescriptor: ObjectExpression,
    linguiInstance?: Expression
  ) {
    return this.types.callExpression(
      this.types.memberExpression(
        linguiInstance ?? this.types.identifier(this.i18nImportName),
        this.types.identifier("_")
      ),
      [messageDescriptor]
    )
  }

  createMessageDescriptorFromTokens(tokens: Tokens, oldLoc?: SourceLocation) {
    const { message, values } = buildICUFromTokens(tokens)

    const properties: ObjectProperty[] = [
      this.createIdProperty(message),

      !this.stripNonEssentialProps
        ? this.createObjectProperty(MESSAGE, this.types.stringLiteral(message))
        : null,

      this.createValuesProperty(values),
    ]

    return this.createMessageDescriptor(
      properties,
      // preserve line numbers for extractor
      oldLoc
    )
  }

  createMessageDescriptor(
    properties: ObjectProperty[],
    oldLoc?: SourceLocation
  ): ObjectExpression {
    const newDescriptor = this.types.objectExpression(
      properties.filter(Boolean)
    )
    this.types.addComment(newDescriptor, "leading", EXTRACT_MARK)
    if (oldLoc) {
      newDescriptor.loc = oldLoc
    }

    return newDescriptor
  }

  createObjectProperty(key: string, value: Expression) {
    return this.types.objectProperty(this.types.identifier(key), value)
  }

  getObjectPropertyByKey(
    objectExp: ObjectExpression,
    key: string
  ): ObjectProperty {
    return objectExp.properties.find(
      (property) =>
        isObjectProperty(property) && this.isLinguiIdentifier(property.key, key)
    ) as ObjectProperty
  }

  /**
   * Custom matchers
   */
  isLinguiIdentifier(node: Node | Expression, name: string) {
    return this.types.isIdentifier(node, {
      name: this.nameMap.get(name) || name,
    })
  }

  isDefineMessage(node: Node | Expression): boolean {
    return (
      this.isLinguiIdentifier(node, "defineMessage") ||
      this.isLinguiIdentifier(node, "msg")
    )
  }

  isArg(node: Node) {
    return (
      this.types.isCallExpression(node) &&
      this.isLinguiIdentifier(node.callee, "arg")
    )
  }

  isI18nMethod(node: Node) {
    return (
      this.types.isTaggedTemplateExpression(node) &&
      (this.isLinguiIdentifier(node.tag, "t") ||
        (this.types.isCallExpression(node.tag) &&
          this.isLinguiIdentifier(node.tag.callee, "t")))
    )
  }

  isChoiceMethod(node: Node) {
    return (
      this.types.isCallExpression(node) &&
      (this.isLinguiIdentifier(node.callee, "plural") ||
        this.isLinguiIdentifier(node.callee, "select") ||
        this.isLinguiIdentifier(node.callee, "selectOrdinal"))
    )
  }

  getTextFromExpression(exp: Expression): string {
    if (this.types.isStringLiteral(exp)) {
      return exp.value
    }

    if (this.types.isTemplateLiteral(exp)) {
      if (exp?.quasis.length === 1) {
        return exp.quasis[0]?.value?.cooked
      }
    }
  }
}
