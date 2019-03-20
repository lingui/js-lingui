const nlRe = /(?:\r\n|\r|\n)+\s+/g

const pluralRules = ["zero", "one", "two", "few", "many", "other"]

const generatorFactory = (index = 0) => () => index++

const initialProps = () => ({
  text: "",
  values: {},
  formats: {},
  argumentGenerator: generatorFactory()
})

export default function({ types: t }) {
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
   * Convert identifiers to *named* arguments and everything else
   * to *positional* arguments.
   *
   * Example
   * `world` is named argument and `new Date()` is positional one
   *
   * Input:   `Hello ${world}, today is ${new Date()}`
   * Output:  `Hello {world}, today is {0}`
   */
  function expressionToArgument(exp, props) {
    const name = t.isIdentifier(exp) ? exp.name : props.argumentGenerator()
    const key = t.isIdentifier(exp) ? exp : t.numericLiteral(name)

    return { name, key }
  }

  function transformI18nMethod(node, file, props) {
    if (t.isCallExpression(node.tag)) {
      // Message with custom ID, where message is used as defaults
      // i18n.t('id')`Hello World`
      const defaults = node.tag.arguments[0]
      if (!t.isStringLiteral(defaults)) {
        throw file.buildCodeFrameError(node.tag, "Message ID must be a string")
      }
      const newProps = transformTemplateLiteral(node.quasi, file, props)
      return {
        ...newProps,
        text: defaults.value,
        defaults: props.text
      }
    }

    return transformTemplateLiteral(node.quasi, file, props)
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
          props = transformMethod(attr.value, file, { ...props, text: "" })
          value = `{${props.text}}`
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
        `Missing ${choicesType} choices. At least fallback argument 'other' is required.`
      )
    } else if (!Array.includes(choicesKeys, "other")) {
      throw file.buildCodeFrameError(
        node.callee,
        `Missing fallback argument 'other'.`
      )
    }

    // validate plural rules
    if (choicesType === "plural" || choicesType === "selectordinal") {
      choicesKeys.forEach(rule => {
        if (!Array.includes(pluralRules, rule) && !/=\d+/.test(rule)) {
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

  function transformTemplateLiteral(exp, file, props) {
    let parts = []

    exp.quasis.forEach((item, index) => {
      parts.push(item)

      if (!item.tail) parts.push(exp.expressions[index])
    })

    parts.forEach(item => {
      if (t.isTemplateElement(item)) {
        props.text += item.value.raw.replace(/\\`/g, "`")
      } else if (
        t.isCallExpression(item) &&
        (isI18nMethod(item.callee) ||
          isChoiceMethod(item.callee) ||
          isFormatMethod(item.callee))
      ) {
        const { text } = transformMethod(item, file, {
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

  function transformMethod(node, file, props, root = false) {
    if (isI18nMethod(node)) {
      // t
      return transformI18nMethod(node, file, props)
    } else if (isChoiceMethod(node.callee)) {
      // plural, select and selectOrdinal
      return transformChoiceMethod(node, file, props, root)
    } else if (isFormatMethod(node.callee)) {
      // date, number
      return transformFormatMethod(node, file, props, root)
    }

    return props
  }

  return function transform(path, file) {
    // 1. Collect all parameters and generate message ID
    const props = transformMethod(path.node, file, initialProps(), true)

    const text = props.text.replace(nlRe, " ").trim()
    if (!text) return

    // 2. Create message descriptor
    const descriptorProps = [
      t.objectProperty(t.identifier("id"), t.StringLiteral(text))
    ]

    if (props.defaults) {
      descriptorProps.push(
        t.objectProperty(
          t.identifier("defaults"),
          t.stringLiteral(props.defaults)
        )
      )
    }

    const formatsList = Object.values(props.formats)
    if (formatsList.length) {
      descriptorProps.push(
        t.objectProperty(
          t.identifier("formats"),
          t.objectExpression(formatsList)
        )
      )
    }

    const valuesList = Object.values(props.values)
    if (valuesList.length) {
      descriptorProps.push(
        t.objectProperty(
          t.identifier("values"),
          t.objectExpression(valuesList.length ? valuesList : [])
        )
      )
    }

    const exp = t.objectExpression(descriptorProps)
    exp.loc = path.node.loc
    path.replaceWith(exp)

    // 3. Add leading `i18n` comment (if doesn't exist) for lingui-extract
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
}
