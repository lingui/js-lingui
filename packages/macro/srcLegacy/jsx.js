import { validatePluralRules } from "./validation"

const commonProps = ["id", "className", "render"]

// replace whitespace before/after newline with single space
const keepSpaceRe = /\s*(?:\r\n|\r|\n)+\s*/g
// remove whitespace before/after tag or expression
const stripAroundTagsRe = /(?:([>}])(?:\r\n|\r|\n)+\s+|(?:\r\n|\r|\n)+\s+(?=[<{]))/g

function normalizeWhitespace(text) {
  return (
    text
      .replace(stripAroundTagsRe, "$1")
      .replace(keepSpaceRe, " ")
      // keep escaped newlines
      .replace(/\\n/, "\n")
      .trim()
  )
}

function cleanChildren(node) {
  node.children = []
  node.openingElement.selfClosing = true
}

const mergeProps = (props, nextProps) => ({
  text: props.text + nextProps.text,
  values: Object.assign({}, props.values, nextProps.values),
  components: props.components.concat(nextProps.components),
  formats: props.formats,
  elementIndex: nextProps.elementIndex
})

const initialProps = ({ formats } = {}) => ({
  text: "",
  values: {},
  components: [],
  formats: formats || {}
})

const generatorFactory = (index = 0) => () => index++

export default class Transformer {
  constructor({ types: t }) {
    this.t = t

    this.isTransElement = this.elementName("Trans")
  }

  getOriginalImportName(local) {
    // Either find original import name or use local one
    const original = Object.keys(this.importDeclarations).filter(
      name => this.importDeclarations[name] === local
    )[0]

    return original || local
  }

  getLocalImportName(name, strict = false) {
    return this.importDeclarations[name] || (!strict && name)
  }

  isIdAttribute(node) {
    return (
      this.t.isJSXAttribute(node) &&
      this.t.isJSXIdentifier(node.name, { name: "id" })
    )
  }

  isDefaultsAttribute(node) {
    return (
      this.t.isJSXAttribute(node) &&
      this.t.isJSXIdentifier(node.name, { name: "defaults" })
    )
  }

  isDescriptionAttribute(node) {
    return (
      this.t.isJSXAttribute(node) &&
      this.t.isJSXIdentifier(node.name, { name: "description" })
    )
  }

  elementName = name => node =>
    this.t.isJSXElement(node) &&
    this.t.isJSXIdentifier(node.openingElement.name, {
      name: this.getLocalImportName(name, true)
    })

  isChooseElement = node =>
    this.elementName("Plural")(node) ||
    this.elementName("Select")(node) ||
    this.elementName("SelectOrdinal")(node)

  isFormatElement = node =>
    this.elementName("DateFormat")(node) ||
    this.elementName("NumberFormat")(node)

  processElement(node, file, props, root = false) {
    const t = this.t
    const element = node.openingElement

    // Trans
    if (this.isTransElement(node)) {
      for (const child of node.children) {
        props = this.processChildren(child, file, props)
      }

      // Plural, Select, SelectOrdinal
    } else if (this.isChooseElement(node)) {
      const componentName = this.getOriginalImportName(element.name.name)

      if (node.children.length) {
        throw file.buildCodeFrameError(
          element,
          `Children of ${componentName} aren't allowed.`
        )
      }

      const choicesType = componentName.toLowerCase()
      const choices = {}
      let variable
      let offset = ""

      for (const attr of element.attributes) {
        const {
          name: { name }
        } = attr

        if (name === "value") {
          const exp = t.isLiteral(attr.value)
            ? attr.value
            : attr.value.expression
          variable = t.isIdentifier(exp) ? exp.name : this.argumentGenerator()
          const key = t.isIdentifier(exp) ? exp : t.numericLiteral(variable)
          props.values[variable] = t.objectProperty(key, exp)
        } else if (commonProps.includes(name)) {
          // just do nothing
        } else if (choicesType !== "select" && name === "offset") {
          // offset is static parameter, so it must be either string or number
          const offsetExp = t.isStringLiteral(attr.value)
            ? attr.value
            : attr.value.expression

          if (offsetExp.value === undefined) {
            throw file.buildCodeFrameError(
              element,
              "Offset argument cannot be a variable."
            )
          }

          offset = ` offset:${offsetExp.value}`
        } else {
          props = this.processChildren(
            attr.value,
            file,
            Object.assign({}, props, { text: "" })
          )
          choices[name.replace("_", "=")] = props.text
        }
      }

      // missing value
      if (variable === undefined) {
        throw file.buildCodeFrameError(element, "Value argument is missing.")
      }

      const choicesKeys = Object.keys(choices)
      validatePluralRules(choicesType, choicesKeys, message => {
        throw file.buildCodeFrameError(element, message)
      })

      const argument = choicesKeys
        .map(form => `${form} {${choices[form]}}`)
        .join(" ")

      props.text = `{${variable}, ${choicesType},${offset} ${argument}}`
      element.attributes = element.attributes.filter(attr =>
        commonProps.includes(attr.name.name)
      )
      element.name = t.JSXIdentifier(this.getLocalImportName("Trans"))
    } else if (this.isFormatElement(node)) {
      if (root) {
        // Don't convert standalone Format elements to ICU MessageFormat.
        // It doesn't make sense to have `{name, number}` message, because we
        // can call number() formatter directly in component.
        return
      }

      const type = this.getOriginalImportName(element.name.name)
        .toLowerCase()
        .replace("format", "")

      let variable, format

      for (const attr of element.attributes) {
        const {
          name: { name }
        } = attr

        if (name === "value") {
          const exp = t.isLiteral(attr.value)
            ? attr.value
            : attr.value.expression
          variable = t.isIdentifier(exp) ? exp.name : this.argumentGenerator()
          const key = t.isIdentifier(exp) ? exp : t.numericLiteral(variable)
          props.values[variable] = t.objectProperty(key, exp)
        } else if (name === "format") {
          if (t.isStringLiteral(attr.value)) {
            format = attr.value.value
          } else if (t.isJSXExpressionContainer(attr.value)) {
            const exp = attr.value.expression
            if (t.isStringLiteral(exp)) {
              format = exp.value
            } else if (t.isObjectExpression(exp) || t.isIdentifier(exp)) {
              if (t.isIdentifier(exp)) {
                format = exp.name
              } else {
                const formatName = new RegExp(`^${type}\\d+$`)
                const existing = Object.keys(props.formats).filter(name =>
                  formatName.test(name)
                )
                format = `${type}${existing.length || 0}`
              }
              props.formats[format] = t.objectProperty(
                t.identifier(format),
                exp
              )
            }
          }

          if (!format) {
            throw file.buildCodeFrameError(
              element,
              "Format can be either string for buil-in formats, variable or object for custom defined formats."
            )
          }
        }
      }

      // missing value
      if (variable === undefined) {
        throw file.buildCodeFrameError(element, "Value argument is missing.")
      }

      const parts = [variable, type]

      if (format) parts.push(format)

      props.text = `{${parts.join(",")}}`
      element.attributes = element.attributes.filter(attr =>
        commonProps.includes(attr.name.name)
      )
      element.name = t.JSXIdentifier(this.getLocalImportName("Trans"))
      // Other elements
    } else {
      if (root) return

      const index = this.elementGenerator()
      const selfClosing = node.openingElement.selfClosing

      props.text += !selfClosing ? `<${index}>` : `<${index}/>`

      for (const child of node.children) {
        props = this.processChildren(child, file, props)
      }

      if (!selfClosing) props.text += `</${index}>`

      cleanChildren(node)
      props.components.unshift(node)
    }

    return props
  }

  processChildren(node, file, props) {
    const t = this.t
    let nextProps = initialProps({ formats: props.formats })

    if (t.isJSXExpressionContainer(node)) {
      const exp = node.expression

      if (t.isStringLiteral(exp)) {
        // Escape forced newlines to keep them in message.
        nextProps.text += exp.value.replace(/\n/, "\\n")
      } else if (t.isTemplateLiteral(exp)) {
        let parts = []

        exp.quasis.forEach((item, index) => {
          parts.push(item)

          if (!item.tail) parts.push(exp.expressions[index])
        })

        parts.forEach(item => {
          if (t.isTemplateElement(item)) {
            nextProps.text += item.value.raw
          } else {
            const name = t.isIdentifier(item)
              ? item.name
              : this.argumentGenerator()
            const key = t.isIdentifier(item) ? item : t.numericLiteral(name)
            nextProps.text += `{${name}}`
            nextProps.values[name] = t.objectProperty(key, item)
          }
        })
      } else if (t.isJSXElement(exp)) {
        nextProps = this.processElement(exp, file, nextProps)
      } else {
        const name = t.isIdentifier(exp) ? exp.name : this.argumentGenerator()
        const key = t.isIdentifier(exp) ? exp : t.numericLiteral(name)
        nextProps.text += `{${name}}`
        nextProps.values[name] = t.objectProperty(key, exp)
      }
    } else if (t.isJSXElement(node)) {
      nextProps = this.processElement(node, file, nextProps)
    } else if (t.isJSXSpreadChild(node)) {
      // TODO: I don't have a clue what's the usecase
    } else if (t.isJSXText(node)) {
      // node.value has HTML entities converted to characters, but we need original
      // HTML entities.
      nextProps.text += node.extra.raw
    } else {
      // Same as above, but this time node.extra.raw also includes surrounding
      // quotes. We need to strip them first.
      nextProps.text += node.extra.raw.replace(/(["'])(.*)\1/, "$2")
    }

    return mergeProps(props, nextProps)
  }

  /**
   * Used for macro
   * @param imports
   */
  setImportDeclarations(imports) {
    // Used for the macro to override the imports
    this.importDeclarations = imports
  }

  getImportDeclarations() {
    return this.importDeclarations
  }

  transform = (path, file) => {
    if (
      !this.importDeclarations ||
      !Object.keys(this.importDeclarations).length
    ) {
      return
    }

    const { node } = path
    const t = this.t
    this.elementGenerator = generatorFactory()
    this.argumentGenerator = generatorFactory()

    // 1. Collect all parameters and inline elements and generate message ID
    const props = this.processElement(
      node,
      file,
      initialProps(),
      /* root= */ true
    )

    if (!props) return

    // 2. Replace children and add collected data

    cleanChildren(node)
    const text = normalizeWhitespace(props.text)
    let attrs = node.openingElement.attributes

    // If `id` prop already exists and generated ID is different,
    // add it as a `default` prop
    const idAttr = attrs.filter(this.isIdAttribute.bind(this))[0]
    if (idAttr && text && idAttr.value.value !== text) {
      attrs.push(
        t.JSXAttribute(t.JSXIdentifier("defaults"), t.StringLiteral(text))
      )
    } else if (!idAttr) {
      attrs.push(t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(text)))
    }

    // Parameters for variable substitution
    const valuesList = Object.values(props.values)
    if (valuesList.length) {
      attrs.push(
        t.JSXAttribute(
          t.JSXIdentifier("values"),
          t.JSXExpressionContainer(t.objectExpression(valuesList))
        )
      )
    }

    // Inline elements
    if (props.components.length) {
      attrs.push(
        t.JSXAttribute(
          t.JSXIdentifier("components"),
          t.JSXExpressionContainer(t.arrayExpression(props.components))
        )
      )
    }

    // Custom formats
    const formatsList = Object.values(props.formats)
    if (formatsList.length) {
      attrs.push(
        t.JSXAttribute(
          t.JSXIdentifier("formats"),
          t.JSXExpressionContainer(t.objectExpression(formatsList))
        )
      )
    }

    if (process.env.NODE_ENV === "production") {
      node.openingElement.attributes = attrs.filter(
        node =>
          !this.isDefaultsAttribute(node) && !this.isDescriptionAttribute(node)
      )
    }
  }
}
