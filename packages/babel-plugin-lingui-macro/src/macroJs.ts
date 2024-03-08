import * as babelTypes from "@babel/types"
import {
  CallExpression,
  Expression,
  Identifier,
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
import {
  COMMENT,
  CONTEXT,
  EXTRACT_MARK,
  ID,
  MESSAGE,
  MACRO_PACKAGE,
  JsMacroName,
} from "./constants"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

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
  useLinguiImportName: string

  stripNonEssentialProps: boolean
}

export default class MacroJs {
  // Babel Types
  types: typeof babelTypes

  // Identifier of i18n object
  i18nImportName: string
  useLinguiImportName: string
  stripNonEssentialProps: boolean

  needsUseLinguiImport = false
  needsI18nImport = false

  // Positional expressions counter (e.g. for placeholders `Hello {0}, today is {1}`)
  _expressionIndex = makeCounter()

  constructor({ types }: { types: typeof babelTypes }, opts: MacroJsOpts) {
    this.types = types
    this.i18nImportName = opts.i18nImportName
    this.useLinguiImportName = opts.useLinguiImportName

    this.stripNonEssentialProps = opts.stripNonEssentialProps
  }

  replacePathWithMessage = (
    path: NodePath,
    tokens: Tokens,
    linguiInstance?: babelTypes.Expression
  ) => {
    return this.createI18nCall(
      this.createMessageDescriptorFromTokens(tokens, path.node.loc),
      linguiInstance
    )
  }

  replacePath = (path: NodePath): false | babelTypes.Expression => {
    // reset the expression counter
    this._expressionIndex = makeCounter()

    // defineMessage({ message: "Message", context: "My" }) -> {id: <hash + context>, message: "Message"}
    if (
      //
      path.isCallExpression() &&
      this.isDefineMessage(path.get("callee"))
    ) {
      return this.processDescriptor(
        path.get("arguments")[0] as NodePath<ObjectExpression>
      )
    }

    // defineMessage`Message` -> {id: <hash>, message: "Message"}
    if (
      path.isTaggedTemplateExpression() &&
      this.isDefineMessage(path.get("tag"))
    ) {
      const tokens = this.tokenizeTemplateLiteral(path.get("quasi"))
      return this.createMessageDescriptorFromTokens(tokens, path.node.loc)
    }

    if (path.isTaggedTemplateExpression()) {
      const tag = path.get("tag")

      // t(i18nInstance)`Message` -> i18nInstance._(messageDescriptor)
      if (
        tag.isCallExpression() &&
        tag.get("arguments")[0].isExpression() &&
        this.isLinguiIdentifier(tag.get("callee"), JsMacroName.t)
      ) {
        // Use the first argument as i18n instance instead of the default i18n instance
        const i18nInstance = tag.get("arguments")[0].node as Expression
        const tokens = this.tokenizeNode(path)

        return this.replacePathWithMessage(path, tokens, i18nInstance)
      }
    }

    // t(i18nInstance)(messageDescriptor) -> i18nInstance._(messageDescriptor)
    if (path.isCallExpression()) {
      const callee = path.get("callee")

      if (
        callee.isCallExpression() &&
        callee.get("arguments")[0].isExpression() &&
        this.isLinguiIdentifier(callee.get("callee"), JsMacroName.t)
      ) {
        const i18nInstance = callee.node.arguments[0] as Expression
        return this.replaceTAsFunction(
          path as NodePath<CallExpression>,
          i18nInstance
        )
      }
    }

    // t({...})
    if (
      path.isCallExpression() &&
      this.isLinguiIdentifier(path.get("callee"), JsMacroName.t)
    ) {
      this.needsI18nImport = true
      return this.replaceTAsFunction(path)
    }

    // { t } = useLingui()
    if (
      path.isCallExpression() &&
      this.isLinguiIdentifier(path.get("callee"), JsMacroName.useLingui)
    ) {
      this.needsUseLinguiImport = true
      return this.processUseLingui(path)
    }

    const tokens = this.tokenizeNode(path, true)

    if (tokens) {
      this.needsI18nImport = true
      return this.replacePathWithMessage(path, tokens)
    }

    return false
  }

  /**
   * macro `t` is called with MessageDescriptor, after that
   * we create a new node to append it to i18n._
   */
  replaceTAsFunction = (
    path: NodePath<CallExpression>,
    linguiInstance?: babelTypes.Expression
  ): babelTypes.CallExpression => {
    const descriptor = this.processDescriptor(
      path.get("arguments")[0] as NodePath<ObjectExpression>
    )

    return this.createI18nCall(descriptor, linguiInstance)
  }

  /**
   * Receives reference to `useLingui()` call
   *
   * Finds every usage of { t } destructured from the call
   * and process each reference as usual `t` macro.
   *
   * const { t } = useLingui()
   * t`Message`
   *
   * ↓ ↓ ↓ ↓ ↓ ↓
   *
   * const { _: _t } = useLingui()
   * _t({id: <hash>, message: "Message"})
   */
  processUseLingui(path: NodePath<CallExpression>) {
    /*
     * path is CallExpression eq:
     * useLingui()
     *
     * path.parentPath should be a VariableDeclarator eq:
     * const { t } = useLingui()
     */
    if (!path.parentPath.isVariableDeclarator()) {
      throw new Error(
        `\`useLingui\` macro must be used in variable declaration.

 Example:

 const { t } = useLingui()
      `
      )
    }

    // looking for `t` property in left side assigment
    // in the declarator `const { t } = useLingui()`
    const varDec = path.parentPath.node
    const _property = this.types.isObjectPattern(varDec.id)
      ? varDec.id.properties.find(
          (
            property
          ): property is ObjectProperty & {
            value: Identifier
            key: Identifier
          } =>
            this.types.isObjectProperty(property) &&
            this.types.isIdentifier(property.key) &&
            this.types.isIdentifier(property.value) &&
            property.key.name == "t"
        )
      : null

    // Enforce destructuring `t` from `useLingui` macro to prevent misuse
    if (!_property) {
      throw new Error(
        `You have to destructure \`t\` when using the \`useLingui\` macro, i.e:
 const { t } = useLingui()
 or
 const { t: _ } = useLingui()
 `
      )
    }

    const uniqTIdentifier = path.scope.generateUidIdentifier("t")

    path.scope
      .getBinding(_property.value.name)
      ?.referencePaths.forEach((refPath) => {
        // reference usually points to Identifier,
        // parent would be an Expression with this identifier which we are interesting in
        const currentPath = refPath.parentPath

        // { t } = useLingui()
        // t`Hello!`
        if (currentPath.isTaggedTemplateExpression()) {
          const tokens = this.tokenizeTemplateLiteral(currentPath)

          const descriptor = this.createMessageDescriptorFromTokens(
            tokens,
            currentPath.node.loc
          )

          const callExpr = this.types.callExpression(
            this.types.identifier(uniqTIdentifier.name),
            [descriptor]
          )

          return currentPath.replaceWith(callExpr)
        }

        // { t } = useLingui()
        // t(messageDescriptor)
        if (
          currentPath.isCallExpression() &&
          currentPath.get("arguments")[0].isObjectExpression()
        ) {
          let descriptor = this.processDescriptor(
            currentPath.get("arguments")[0] as NodePath<ObjectExpression>
          )
          const callExpr = this.types.callExpression(
            this.types.identifier(uniqTIdentifier.name),
            [descriptor]
          )

          return currentPath.replaceWith(callExpr)
        }

        // for rest of cases just rename identifier for run-time counterpart
        refPath.replaceWith(this.types.identifier(uniqTIdentifier.name))
      })

    // assign uniq identifier for runtime `_`
    // { t } = useLingui() -> { _ : _t } = useLingui()
    _property.key.name = "_"
    _property.value.name = uniqTIdentifier.name

    return this.types.callExpression(
      this.types.identifier(this.useLinguiImportName),
      []
    )
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
  processDescriptor = (descriptor: NodePath<ObjectExpression>) => {
    const messageProperty = this.getObjectPropertyByKey(descriptor, MESSAGE)
    const idProperty = this.getObjectPropertyByKey(descriptor, ID)
    const contextProperty = this.getObjectPropertyByKey(descriptor, CONTEXT)
    const commentProperty = this.getObjectPropertyByKey(descriptor, COMMENT)

    const properties: ObjectProperty[] = []

    if (idProperty) {
      properties.push(idProperty.node)
    }

    if (!this.stripNonEssentialProps && contextProperty) {
      properties.push(contextProperty.node)
    }

    // if there's `message` property, replace macros with formatted message
    if (messageProperty) {
      // Inside message descriptor the `t` macro in `message` prop is optional.
      // Template strings are always processed as if they were wrapped by `t`.
      const messageValue = messageProperty.get("value")

      const tokens = messageValue.isTemplateLiteral()
        ? this.tokenizeTemplateLiteral(messageValue)
        : this.tokenizeNode(messageValue, true)

      let messageNode = messageValue.node as StringLiteral

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
          this.getTextFromExpression(
            contextProperty.get("value").node as Expression
          )

        properties.push(this.createIdProperty(messageNode.value, context))
      }
    }

    if (!this.stripNonEssentialProps && commentProperty) {
      properties.push(commentProperty.node)
    }

    return this.createMessageDescriptor(properties, descriptor.node.loc)
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

  tokenizeNode(path: NodePath, ignoreExpression = false): Token[] {
    const node = path.node

    if (this.isI18nMethod(path)) {
      // t
      return this.tokenizeTemplateLiteral(path as NodePath<Expression>)
    }

    const choiceMethod = this.isChoiceMethod(path)
    // plural, select and selectOrdinal
    if (choiceMethod) {
      return [
        this.tokenizeChoiceComponent(
          path as NodePath<CallExpression>,
          choiceMethod
        ),
      ]
    }
    //   if (isFormatMethod(node.callee)) {
    //   // date, number
    //   return transformFormatMethod(node, file, props, root)

    if (!ignoreExpression) {
      return [this.tokenizeExpression(node)]
    }
  }

  /**
   * `node` is a TemplateLiteral. node.quasi contains
   * text chunks and node.expressions contains expressions.
   * Both arrays must be zipped together to get the final list of tokens.
   */
  tokenizeTemplateLiteral(path: NodePath<Expression>): Token[] {
    const tpl = path.isTaggedTemplateExpression()
      ? path.get("quasi")
      : (path as NodePath<TemplateLiteral>)

    const expressions = tpl.get("expressions") as NodePath<Expression>[]

    return tpl.get("quasis").flatMap((text, i) => {
      // if it's an unicode we keep the cooked value because it's the parsed value by babel (without unicode chars)
      // This regex will detect if a string contains unicode chars, when they're we should interpolate them
      // why? because platforms like react native doesn't parse them, just doing a JSON.parse makes them UTF-8 friendly
      const value = /\\u[a-fA-F0-9]{4}|\\x[a-fA-F0-9]{2}/g.test(
        text.node.value.raw
      )
        ? text.node.value.cooked
        : text.node.value.raw

      let argTokens: Token[] = []
      const currExp = expressions[i]

      if (currExp) {
        argTokens = currExp.isCallExpression()
          ? this.tokenizeNode(currExp)
          : [this.tokenizeExpression(currExp.node)]
      }
      const textToken: TextToken = {
        type: "text",
        value: this.clearBackslashes(value),
      }
      return [...(value ? [textToken] : []), ...argTokens]
    })
  }

  tokenizeChoiceComponent(
    path: NodePath<CallExpression>,
    componentName: string
  ): ArgToken {
    const format = componentName.toLowerCase()

    const token: ArgToken = {
      ...this.tokenizeExpression(path.node.arguments[0]),
      format: format,
      options: {
        offset: undefined,
      },
    }

    const props = (path.get("arguments")[1] as NodePath<ObjectExpression>).get(
      "properties"
    )

    for (const attr of props) {
      if (!attr.isObjectProperty()) {
        throw new Error("Expected an ObjectProperty")
      }

      const key = attr.get("key")
      const attrValue = attr.get("value") as NodePath<Expression>

      // name is either:
      // NumericLiteral => convert to `={number}`
      // StringLiteral => key.value
      // Identifier => key.name
      const name = key.isNumericLiteral()
        ? `=${key.node.value}`
        : (key.node as Identifier).name || (key.node as StringLiteral).value

      if (format !== "select" && name === "offset") {
        token.options.offset = (attrValue.node as StringLiteral).value
      } else {
        let value: ArgToken["options"][string]

        if (attrValue.isTemplateLiteral()) {
          value = this.tokenizeTemplateLiteral(attrValue)
        } else if (attrValue.isCallExpression()) {
          value = this.tokenizeNode(attrValue)
        } else if (attrValue.isStringLiteral()) {
          value = attrValue.node.value
        } else if (attrValue.isExpression()) {
          value = this.tokenizeExpression(attrValue.node)
        } else {
          value = (attrValue as unknown as StringLiteral).value
        }
        token.options[name] = value
      }
    }

    return token
  }

  tokenizeExpression(node: Node | Expression): ArgToken {
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
    // if not we replace the extra escaped literals
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
    objectExp: NodePath<ObjectExpression>,
    key: string
  ): NodePath<ObjectProperty> {
    return objectExp.get("properties").find(
      (property) =>
        property.isObjectProperty() &&
        (property.get("key") as NodePath<Expression>).isIdentifier({
          name: key,
        })
    ) as NodePath<ObjectProperty>
  }

  /**
   * Custom matchers
   */
  isLinguiIdentifier(path: NodePath, name: JsMacroName) {
    if (path.isIdentifier() && path.referencesImport(MACRO_PACKAGE, name)) {
      return true
    }
  }

  isDefineMessage(path: NodePath): boolean {
    return (
      this.isLinguiIdentifier(path, JsMacroName.defineMessage) ||
      this.isLinguiIdentifier(path, JsMacroName.msg)
    )
  }

  isI18nMethod(path: NodePath) {
    if (!path.isTaggedTemplateExpression()) {
      return
    }

    const tag = path.get("tag")

    return (
      this.isLinguiIdentifier(tag, JsMacroName.t) ||
      (tag.isCallExpression() &&
        this.isLinguiIdentifier(tag.get("callee"), JsMacroName.t))
    )
  }

  isChoiceMethod(path: NodePath) {
    if (!path.isCallExpression()) {
      return
    }

    const callee = path.get("callee")

    if (this.isLinguiIdentifier(callee, JsMacroName.plural)) {
      return JsMacroName.plural
    }
    if (this.isLinguiIdentifier(callee, JsMacroName.select)) {
      return JsMacroName.select
    }
    if (this.isLinguiIdentifier(callee, JsMacroName.selectOrdinal)) {
      return JsMacroName.selectOrdinal
    }
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
