const nlRe = /(?:\r\n|\r|\n)+\s+/g

const pluralRules = ["zero", "one", "two", "few", "many", "other"]

const generatorFactory = (index = 0) => () => index++

function normalizeWhitespace(text) {
  return text
    .replace(keepSpaceRe, " ")
    .replace(keepNewLineRe, "\n")
    .trim()
}

export default function({ types: t }) {
  /**
   * `transform` is the macro entry point. It takes matched AST node (`path`) and
   * reference to `file` being processed.
   */
  function transform(path, file) {
    const initialProps = {
      text: "",
      values: {},
      formats: {},
      argumentGenerator: generatorFactory()
    }

    // 1. Transform template string literals and i18n methods to ICU Message Format
    const props = transformNode(path.node, file, initialProps, true)

    props.text = normalizeWhitespace(props.text)
    if (!props.text) return

    // 2. Create message descriptor
    const exp = createMessageDescriptor(props)

    // 3. Copy source line info
    exp.loc = path.node.loc
    path.replaceWith(exp)

    // 4. Add leading `i18n` comment (if doesn't exist) for lingui-extract
    let nodeWithComments =
      path.parentPath.type === "ExpressionStatement"
        ? path.parentPath.node
        : path.node
    const i18nComment =
      nodeWithComments.leadingComments &&
      nodeWithComments.leadingComments.filter(
        node => node.value.trim().substr(0, 4) === "i18n"
      )[0]

    if (!i18nComment) {
      path.addComment("leading", "i18n")
    }
  }

  function transformNode(node, file, props, root = false) {
    if (isI18nMethod(node)) {
      // t
      return transformTemplateTag(node, file, props)
    } else if (isChoiceMethod(node.callee)) {
      // plural, select and selectOrdinal
      return transformChoiceMethod(node, file, props, root)
    } else if (isFormatMethod(node.callee)) {
      // date, number
      return transformFormatMethod(node, file, props, root)
    }

    return props
  }

  /**
   * Once we transform macro, we have an object with message props:
   * - text: this will become msg ID
   * - defaults: defualt message if custom message ID is used
   * - values: variables and values
   * - formats: date/number formats
   *
   * This object is transformed to *message descriptor*, an object passed to `i18n._`
   * method which performs translation and formatting.
   */
  function createMessageDescriptor(props) {
    const descriptor = [
      t.objectProperty(t.identifier("id"), t.StringLiteral(props.text))
    ]

    if (props.defaults) {
      descriptor.push(
        t.objectProperty(
          t.identifier("defaults"),
          t.stringLiteral(props.defaults)
        )
      )
    }

    const formatsList = Object.values(props.formats)
    if (formatsList.length) {
      descriptor.push(
        t.objectProperty(
          t.identifier("formats"),
          t.objectExpression(formatsList)
        )
      )
    }

    const valuesList = Object.values(props.values)
    if (valuesList.length) {
      descriptor.push(
        t.objectProperty(
          t.identifier("values"),
          t.objectExpression(valuesList.length ? valuesList : [])
        )
      )
    }

    return t.objectExpression(descriptor)
  }

  function transformTemplateTag(node, file, props) {
    const { tag, quasi } = node

    if (!t.isCallExpression(tag)) {
      /**
       * t`Message`
       * Simple templatetag - generated message is used as an ID
       */
      return transformTemplateLiteral(node.quasi, file, props)
    }

    /**
     * t('id')`Message`
     * Template tag with an argument - generated message is used as a default one
     */
    const msgId = tag.arguments[0]
    if (!t.isStringLiteral(msgId)) {
      // TODO: Add link to lazy translation in docs.
      throw file.buildCodeFrameError(tag, "Message ID must be a string.")
    }

    const newProps = transformTemplateLiteral(quasi, file, props)
    return {
      ...newProps,
      text: msgId.value,
      // FIXME: Why not newProps.text?
      defaults: props.text
    }
  }

  function transformTemplateLiteral(exp, file, props) {
    let parts = []

    exp.quasis.forEach((item, index) => {
      parts.push(item)

      if (!item.tail) parts.push(exp.expressions[index])
    })

    parts.forEach(item => {
      if (t.isTemplateElement(item)) {
        props.text += item.value.raw
      } else if (
        t.isCallExpression(item) &&
        (isI18nMethod(item.callee) ||
          isChoiceMethod(item.callee) ||
          isFormatMethod(item.callee))
      ) {
        const { text } = transformNode(item, file, {
          ...props,
          text: ""
        })
        props.text += `{${text}}`
      } else {
        const { name, key } = expressionToArgument(item, props)

        props.text += `{${name}}`
        props.values[name] = t.objectProperty(key, item)
      }
    })

    return props
  }

  function transformChoiceMethod(node, file, props, root = false) {
    const choices = {}
    const choicesType = node.callee.name.toLowerCase()
    let defaults
    let variable
    let offset = ""

    let choiceArguments = node.arguments[0]
    if (t.isStringLiteral(choiceArguments)) {
      defaults = choiceArguments.value
      choiceArguments = node.arguments[1]
    }

    for (const attr of choiceArguments.properties) {
      if (attr.computed) {
        throw file.buildCodeFrameError(
          attr,
          "Computed properties aren't allowed."
        )
      }

      const { key } = attr
      // key is either:
      // NumericLiteral => convert to `={number}`
      // StringLiteral => key.value
      // Literal => key.name
      const name = t.isNumericLiteral(key)
        ? `=${key.value}`
        : key.name || key.value

      if (name === "value") {
        const exp = attr.value
        const { name, key } = expressionToArgument(exp, props)
        variable = name
        props.values[name] = t.objectProperty(key, exp)
      } else if (choicesType !== "select" && name === "offset") {
        // offset is static parameter, so it must be either string or number
        if (!t.isNumericLiteral(attr.value) && !t.isStringLiteral(attr.value)) {
          throw file.buildCodeFrameError(
            node.callee,
            "Offset argument cannot be a variable."
          )
        }
        offset = ` offset:${attr.value.value}`
      } else {
        let value = ""

        if (t.isTemplateLiteral(attr.value)) {
          props = transformTemplateLiteral(attr.value, file, {
            ...props,
            text: ""
          })
          value = props.text
        } else if (t.isCallExpression(attr.value)) {
          props = transformNode(attr.value, file, { ...props, text: "" })
          value = props.text
        } else {
          value = attr.value.value
        }
        choices[name] = value
      }
    }

    // missing value
    if (variable === undefined) {
      throw file.buildCodeFrameError(node.callee, "Value argument is missing.")
    }

    const choicesKeys = Object.keys(choices)

    // 'other' choice is required
    if (!choicesKeys.length) {
      throw file.buildCodeFrameError(
        node.callee,
        `Missing ${choicesType} choices. At least one plural should be provided.`
      )
    }

    // validate plural rules
    if (choicesType === "plural" || choicesType === "selectordinal") {
      choicesKeys.forEach(rule => {
        if (!pluralRules.includes(rule) && !/=\d+/.test(rule)) {
          throw file.buildCodeFrameError(
            node.callee,
            `Invalid plural rule '${rule}'. Must be ${pluralRules.join(
              ", "
            )} or exact number depending on your source language ('one' and 'other' for English).`
          )
        }
      })
    }

    const argument = choicesKeys
      .map(form => `${form} {${choices[form]}}`)
      .join(" ")
    const format = `${variable}, ${choicesType},${offset} ${argument}`
    props.text = root ? `{${format}}` : format

    if (defaults) {
      return {
        ...props,
        text: defaults,
        defaults: props.text
      }
    }

    return props
  }

  function transformFormatMethod(node, file, props, root) {
    const exp = node.arguments[0]

    // missing value
    if (exp === undefined) {
      throw file.buildCodeFrameError(
        node.callee,
        "The first argument of format function must be a variable."
      )
    }

    const { name, key } = expressionToArgument(exp, props)

    const type = node.callee.name
    const parts = [
      name, // variable name
      type // format type
    ]

    let format = ""
    const formatArg = node.arguments[1]
    if (!formatArg) {
      // Do not throw validation error when format doesn't exist
    } else if (t.isStringLiteral(formatArg)) {
      format = formatArg.value
    } else if (t.isIdentifier(formatArg) || t.isObjectExpression(formatArg)) {
      if (t.isIdentifier(formatArg)) {
        format = formatArg.name
      } else {
        const formatName = new RegExp(`^${type}\\d+$`)
        const existing = Object.keys(props.formats).filter(name =>
          formatName.test(name)
        )
        format = `${type}${existing.length || 0}`
      }

      props.formats[format] = t.objectProperty(t.identifier(format), formatArg)
    } else {
      throw file.buildCodeFrameError(
        formatArg,
        "Format can be either string for buil-in formats, variable or object for custom defined formats."
      )
    }

    if (format) parts.push(format)

    props.values[name] = t.objectProperty(key, exp)
    props.text += `${parts.join(",")}`

    return props
  }

  /**
   * Custom matchers
   */

  const isIdentifier = (node, name) => t.isIdentifier(node, { name })

  const isI18nMethod = node =>
    isIdentifier(node.tag, "t") ||
    (t.isCallExpression(node.tag) && isIdentifier(node.tag.callee, "t"))

  const isChoiceMethod = node =>
    isIdentifier(node, "plural") ||
    isIdentifier(node, "select") ||
    isIdentifier(node, "selectOrdinal")

  const isFormatMethod = node =>
    isIdentifier(node, "date") || isIdentifier(node, "number")

  /**
   * Convert identifiers to *named* arguments and expressions to *positional* arguments.
   *
   * Example
   * `world` is named argument and `new Date()` is positional one:
   *
   * Input:   `Hello ${world}, today is ${new Date()}`
   * Output:  `Hello {world}, today is {0}`
   */
  function expressionToArgument(exp, props) {
    const name = t.isIdentifier(exp) ? exp.name : props.argumentGenerator()
    const key = t.isIdentifier(exp) ? exp : t.numericLiteral(name)

    return { name, key }
  }

  return transform
}
