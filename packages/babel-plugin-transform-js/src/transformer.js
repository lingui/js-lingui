const nlRe = /(?:\r\n|\r|\n)+\s+/g

const pluralRules = ["zero", "one", "two", "few", "many", "other"]

const generatorFactory = (index = 0) => () => index++

const initialProps = () => ({
  text: "",
  values: {},
  formats: {}
})

export default class Transformer {
  constructor({ types: t }, options = {}) {
    this.options = options
    this.t = t

    if (this.options.standalone) {
      this.isI18nMethod = node =>
        this._isIdentifier(node.tag, "t") ||
        (this.t.isCallExpression(node.tag) &&
          this._isIdentifier(node.tag.callee, "t"))

      this.isChoiceMethod = node =>
        this._isIdentifier(node, "plural") ||
        this._isIdentifier(node, "select") ||
        this._isIdentifier(node, "selectOrdinal")

      this.isFormatMethod = node =>
        this._isIdentifier(node, "date") || this._isIdentifier(node, "number")
    } else {
      this.isI18nMethod = node =>
        (this.t.isMemberExpression(node.tag) &&
          this.t.isIdentifier(node.tag.object, { name: "i18n" }) &&
          this.t.isIdentifier(node.tag.property, { name: "t" })) ||
        (this.t.isCallExpression(node.tag) &&
          this.t.isMemberExpression(node.tag.callee) &&
          this.t.isIdentifier(node.tag.callee.object, { name: "i18n" }) &&
          this.t.isIdentifier(node.tag.callee.property, { name: "t" }))

      this.isChoiceMethod = node =>
        this.t.isMemberExpression(node) &&
        this.t.isIdentifier(node.object, { name: "i18n" }) &&
        (this._isIdentifier(node.property, "plural") ||
          this._isIdentifier(node.property, "select") ||
          this._isIdentifier(node.property, "selectOrdinal"))

      this.isFormatMethod = node =>
        this.t.isMemberExpression(node) &&
        this.t.isIdentifier(node.object, { name: "i18n" }) &&
        (this._isIdentifier(node.property, "date") ||
          this._isIdentifier(node.property, "number"))
    }
  }

  /**
   * Convert identifiers to *named* arguments and everything else
   * to *positional* arguments.
   *
   * Example:
   * `world` is named argument and `new Date()` is positional one
   *
   * Input:   `Hello ${world}, today is ${new Date()}`
   * Output:  `Hello {world}, today is {0}`
   */
  expressionToArgument(exp) {
    const name = this.t.isIdentifier(exp) ? exp.name : this.argumentGenerator()
    const key = this.t.isIdentifier(exp) ? exp : this.t.numericLiteral(name)

    return { name, key }
  }

  transformI18nMethod(node, file, props) {
    if (this.t.isCallExpression(node.tag)) {
      const newProps = this.transformTemplateLiteral(node.quasi, file, props)
        
      // Message with custom ID, where message is used as defaults
      const defaults = node.tag.arguments[0]
      if (this.t.isStringLiteral(defaults)) { 
        // i18n.t('id')`Hello World`
        return {
          ...newProps,
          text: defaults.value,
          defaults: props.text
        }
      } else if (this.t.isObjectExpression(defaults)) {
        // i18n.t({id: 'id', context: 'context})`Hello World`
        const idProperty = defaults.properties.find(x => x.key.name === "id");
        const contextProperty = defaults.properties.find(x => x.key.name === "context");
        const idOverrides = idProperty ? {
          text: idProperty.value.value,
          defaults: props.text,
        } : {};
        const contextOverrides = contextProperty ? {
          context: contextProperty.value.value
        } : {};

        return {
          ...newProps,
          ...idOverrides,
          ... contextOverrides
        }
      } else {
        throw file.buildCodeFrameError(node.tag, "Message ID must be a string or object with keys { id, context }")
      }
    }

    // Message is used as the ID
    // i18n.t`Hello World`
    return this.transformTemplateLiteral(node.quasi, file, props)
  }

  transformChoiceMethod(node, file, props, root = false) {
    const choices = {}
    const choicesType = this._calleeName(node).toLowerCase()
    let defaults
    let variable
    let offset = ""

    let choiceArguments = node.arguments[0]
    if (this.t.isStringLiteral(choiceArguments)) {
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
      const name = this.t.isNumericLiteral(key)
        ? `=${key.value}`
        : key.name || key.value

      if (name === "value") {
        const exp = attr.value
        const { name, key } = this.expressionToArgument(exp)
        variable = name
        props.values[name] = this.t.objectProperty(key, exp)
      } else if (choicesType !== "select" && name === "offset") {
        // offset is static parameter, so it must be either string or number
        if (
          !this.t.isNumericLiteral(attr.value) &&
          !this.t.isStringLiteral(attr.value)
        ) {
          throw file.buildCodeFrameError(
            node.callee,
            "Offset argument cannot be a variable."
          )
        }
        offset = ` offset:${attr.value.value}`
      } else {
        let value = ""

        if (this.t.isTemplateLiteral(attr.value)) {
          props = this.transformTemplateLiteral(attr.value, file, {
            ...props,
            text: ""
          })
          value = props.text
        } else if (this.t.isCallExpression(attr.value)) {
          props = this.transformMethod(attr.value, file, { ...props, text: "" })
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

  transformFormatMethod(node, file, props, root) {
    const exp = node.arguments[0]

    // missing value
    if (exp === undefined) {
      throw file.buildCodeFrameError(
        node.callee,
        "The first argument of format function must be a variable."
      )
    }

    const { name, key } = this.expressionToArgument(exp)

    const type = this._calleeName(node)
    const parts = [
      name, // variable name
      type // format type
    ]

    let format = ""
    const formatArg = node.arguments[1]
    if (!formatArg) {
      // Do not throw validation error when format doesn't exist
    } else if (this.t.isStringLiteral(formatArg)) {
      format = formatArg.value
    } else if (
      this.t.isIdentifier(formatArg) ||
      this.t.isObjectExpression(formatArg)
    ) {
      if (this.t.isIdentifier(formatArg)) {
        format = formatArg.name
      } else {
        const formatName = new RegExp(`^${type}\\d+$`)
        const existing = Object.keys(props.formats).filter(name =>
          formatName.test(name)
        )
        format = `${type}${existing.length || 0}`
      }

      props.formats[format] = this.t.objectProperty(
        this.t.identifier(format),
        formatArg
      )
    } else {
      throw file.buildCodeFrameError(
        formatArg,
        "Format can be either string for buil-in formats, variable or object for custom defined formats."
      )
    }

    if (format) parts.push(format)

    props.values[name] = this.t.objectProperty(key, exp)
    props.text += `${parts.join(",")}`

    return props
  }

  transformTemplateLiteral(exp, file, props) {
    let parts = []

    exp.quasis.forEach((item, index) => {
      parts.push(item)

      if (!item.tail) parts.push(exp.expressions[index])
    })

    parts.forEach(item => {
      if (this.t.isTemplateElement(item)) {
        props.text += item.value.raw
      } else if (
        this.t.isCallExpression(item) &&
        (this.isI18nMethod(item.callee) ||
          this.isChoiceMethod(item.callee) ||
          this.isFormatMethod(item.callee))
      ) {
        const { text } = this.transformMethod(item, file, {
          ...props,
          text: ""
        })
        props.text += `{${text}}`
      } else {
        const { name, key } = this.expressionToArgument(item)

        props.text += `{${name}}`
        props.values[name] = this.t.objectProperty(key, item)
      }
    })

    return props
  }

  transformMethod(node, file, props, root = false) {
    if (this.isI18nMethod(node)) {
      // i18n.t
      return this.transformI18nMethod(node, file, props)
    } else if (this.isChoiceMethod(node.callee)) {
      // i18n.plural, i18n.select and i18n.selectOrdinal
      return this.transformChoiceMethod(node, file, props, root)
    } else if (this.isFormatMethod(node.callee)) {
      // i18n.date, i18n.number
      return this.transformFormatMethod(node, file, props, root)
    }

    return props
  }

  transform = (path, file) => {
    this.argumentGenerator = generatorFactory()

    // 1. Collect all parameters and generate message ID

    const props = this.transformMethod(path.node, file, initialProps(), true)

    const text = props.text.replace(nlRe, " ").trim()
    if (!text) return

    // 2. Replace complex expression with single call to i18n._

    const tOptions = []

    const formatsList = Object.values(props.formats)
    if (formatsList.length) {
      tOptions.push(
        this.t.objectProperty(
          this.t.identifier("formats"),
          this.t.objectExpression(formatsList)
        )
      )
    }

    if (props.defaults) {
      tOptions.push(
        this.t.objectProperty(
          this.t.identifier("defaults"),
          this.t.stringLiteral(props.defaults)
        )
      )
    }

    if (props.context) {
      tOptions.push(
        this.t.objectProperty(
          this.t.identifier("context"),
          this.t.stringLiteral(props.context)
        )
      )
    }

    // arguments of i18n._(messageId: string, values: Object, options: Object)
    const tArgs = [this.t.StringLiteral(text)] // messageId

    const valuesList = Object.values(props.values)
    // omit second argument when there're no values and no options,
    // i.e: simplify i18n._(id, {}) to i18n._(id)
    if (valuesList.length || tOptions.length) {
      tArgs.push(this.t.objectExpression(valuesList.length ? valuesList : []))
    }

    // add options argument
    if (tOptions.length) tArgs.push(this.t.objectExpression(tOptions))

    // replace i18n.t`...` with i18n._(...), but remember original location
    const exp = this.t.callExpression(
      this.t.memberExpression(
        this.t.identifier("i18n"),
        this.t.identifier("_")
      ),
      tArgs
    )
    exp.loc = path.node.loc
    path.replaceWith(exp)
  }

  _isIdentifier(node, name) {
    return this.t.isIdentifier(node, { name })
  }

  _calleeName(node) {
    if (this.options.standalone) {
      return node.callee.name
    } else {
      return node.callee.property.name
    }
  }
}
