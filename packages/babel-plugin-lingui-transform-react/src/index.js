const pluralRules = ['zero', 'one', 'two', 'few', 'many', 'other']

function cleanChildren (node) {
  node.children = []
  node.openingElement.selfClosing = true
}

const mergeProps = (props, nextProps) => ({
  text: props.text + nextProps.text,
  params: Object.assign({}, props.params, nextProps.params),
  components: props.components.concat(nextProps.components),
  formats: props.formats,
  elementIndex: nextProps.elementIndex
})

const initialProps = ({ formats } = {}) => ({
  text: '',
  params: {},
  components: [],
  formats: formats || {}
})

const elementGeneratorFactory = () => {
  let index = 0
  return () => index++
}

// Plugin function
export default function ({ types: t }) {
  let elementGenerator

  function isIdAttribute (node) {
    return t.isJSXAttribute(node) && t.isJSXIdentifier(node.name, {name: 'id'})
  }

  const elementName = name => node =>
    t.isJSXElement(node) && t.isJSXIdentifier(node.openingElement.name, { name })

  const isTransElement = elementName('Trans')
  const isChooseElement = (node) => (
    elementName('Plural')(node) ||
    elementName('Select')(node) ||
    elementName('SelectOrdinal')(node)
  )
  const isFormatElement = (node) => (
    elementName('DateFormat')(node) ||
    elementName('NumberFormat')(node)
  )

  function processElement (node, file, props, root = false) {
    const element = node.openingElement

    // Trans
    if (isTransElement(node)) {
      for (const child of node.children) {
        props = processChildren(child, file, props)
      }

    // Plural, Select, SelectOrdinal
    } else if (isChooseElement(node)) {
      if (node.children.length) {
        throw file.buildCodeFrameError(element, `Children of ${element.name.name} aren't allowed.`)
      }

      const choicesType = element.name.name.toLowerCase()
      const choices = {}
      let variable
      let offset = ''

      for (const attr of element.attributes) {
        const { name: { name } } = attr

        if (name === 'value') {
          const exp = attr.value.expression

          // value must be a variable
          if (!t.isIdentifier(exp)) {
            throw file.buildCodeFrameError(element, 'Value must be a variable.')
          }

          variable = exp.name
          props.params[variable] = t.objectProperty(exp, exp)
        } else if (choicesType !== 'select' && name === 'offset') {
          // offset is static parameter, so it must be either string or number
          if (!t.isNumericLiteral(attr.value) && !t.isStringLiteral(attr.value)) {
            throw file.buildCodeFrameError(element, 'Offset argument cannot be a variable.')
          }

          offset = ` offset:${attr.value.value}`
        } else {
          props = processChildren(attr.value, file, Object.assign({}, props, { text: '' }))
          choices[name.replace('_', '=')] = props.text
        }
      }

      // missing value
      if (!variable) {
        throw file.buildCodeFrameError(element, 'Value argument is missing.')
      }

      const choicesKeys = Object.keys(choices)

      // 'other' choice is required
      if (!choicesKeys.length) {
        throw file.buildCodeFrameError(
          element,
          `Missing ${choicesType} choices. At least fallback argument 'other' is required.`
        )
      } else if (!Array.includes(choicesKeys, 'other')) {
        throw file.buildCodeFrameError(
          element, `Missing fallback argument 'other'.`)
      }

      // validate plural rules
      if (choicesType === 'plural' || choicesType === 'selectordinal') {
        choicesKeys.forEach(rule => {
          if (!Array.includes(pluralRules, rule) && !/=\d+/.test(rule)) {
            throw file.buildCodeFrameError(
              element,
              `Invalid plural rule '${rule}'. Must be ${pluralRules.join(', ')} or exact number depending on your source language ('one' and 'other' for English).`
            )
          }
        })
      }

      const argument = choicesKeys.map(form => `${form} {${choices[form]}}`).join(' ')

      props.text = `{${variable}, ${choicesType},${offset} ${argument}}`
      element.attributes = element.attributes.filter(attr => attr.name.name === 'props')
      element.name = t.JSXIdentifier('Trans')
    } else if (isFormatElement(node)) {
      const type = element.name.name.toLowerCase().replace('format', '')

      let variable, format

      for (const attr of element.attributes) {
        const { name: { name } } = attr

        if (name === 'value') {
          const exp = attr.value.expression

          // value must be a variable
          if (!t.isIdentifier(exp)) {
            throw file.buildCodeFrameError(element, 'Value must be a variable.')
          }

          variable = exp.name
          props.params[variable] = t.objectProperty(exp, exp)
        } else if (name === 'format') {
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
                const existing = Object.keys(props.formats)
                  .filter(name => formatName.test(name))
                format = `${type}${existing.length || 0}`
              }
              props.formats[format] = t.objectProperty(t.identifier(format), exp)
            }
          }

          if (!format) {
            throw file.buildCodeFrameError(element, 'Format can be either string for buil-in formats, variable or object for custom defined formats.')
          }
        }
      }

      // missing value
      if (!variable) {
        throw file.buildCodeFrameError(element, 'Value argument is missing.')
      }

      const parts = [
        variable,
        type
      ]

      if (format) parts.push(format)

      props.text = `{${parts.join(',')}}`
      element.attributes = element.attributes.filter(attr => attr.name.name === 'props')
      element.name = t.JSXIdentifier('Trans')
    // Other elements
    } else {
      if (root) return

      const index = elementGenerator()
      const selfClosing = node.openingElement.selfClosing

      props.text += !selfClosing ? `<${index}>` : `<${index}/>`

      for (const child of node.children) {
        props = processChildren(child, file, props)
      }

      if (!selfClosing) props.text += `</${index}>`

      cleanChildren(node)
      props.components.unshift(node)
    }

    return props
  }

  function processChildren (node, file, props) {
    let nextProps = initialProps({ formats: props.formats })

    if (t.isJSXExpressionContainer(node)) {
      const exp = node.expression

      if (t.isIdentifier(exp)) {
        nextProps.text += `{${exp.name}}`
        nextProps.params[exp.name] = t.objectProperty(exp, exp)
      } else if (t.isTemplateLiteral(exp)) {
        let parts = []

        exp.quasis.forEach((item, index) => {
          parts.push(item)

          if (!item.tail) parts.push(exp.expressions[index])
        })

        parts.forEach((item) => {
          if (t.isTemplateElement(item)) {
            nextProps.text += item.value.raw
          } else {
            nextProps.text += `{${item.name}}`
            nextProps.params[item.name] = t.objectProperty(item, item)
          }
        })
      } else if (t.isJSXElement(exp)) {
        nextProps = processElement(exp, file, nextProps)
      } else {
        nextProps.text += exp.value
      }
    } else if (t.isJSXElement(node)) {
      nextProps = processElement(node, file, nextProps)
    } else if (t.isJSXSpreadChild(node)) {
      // TODO: I don't have a clue what's the usecase

    } else {
      nextProps.text += node.value
    }

    // normalize spaces
    nextProps.text = nextProps.text.replace(/\n\s+/g, '\n')

    return mergeProps(props, nextProps)
  }

  return {
    visitor: {
      JSXElement ({ node }, file) {
        elementGenerator = elementGeneratorFactory()

        // 1. Collect all parameters and inline elements and generate message ID

        const props = processElement(node, file, initialProps(), /* root= */true)

        if (!props) return

        // 2. Replace children and add collected data

        cleanChildren(node)
        props.text = props.text.trim()
        const attrs = node.openingElement.attributes

        // If `id` prop already exists and generated ID is different,
        // add it as a `default` prop
        const idAttr = attrs.filter(isIdAttribute)[0]
        if (idAttr && idAttr.value.value !== props.text) {
          attrs.push(
            t.JSXAttribute(t.JSXIdentifier('defaults'), t.StringLiteral(props.text))
          )
        } else if (!idAttr) {
          attrs.push(
            t.JSXAttribute(t.JSXIdentifier('id'), t.StringLiteral(props.text))
          )
        }

        // Parameters for variable substitution
        const paramsList = Object.values(props.params)
        if (paramsList.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier('params'),
              t.JSXExpressionContainer(t.objectExpression(paramsList)))
          )
        }

        // Inline elements
        if (props.components.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier('components'),
              t.JSXExpressionContainer(t.arrayExpression(props.components))
            )
          )
        }

        // Custom formats
        const formatsList = Object.values(props.formats)
        if (formatsList.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier('formats'),
              t.JSXExpressionContainer(t.objectExpression(formatsList)))
          )
        }
      } // JSXElement
    } // visitor
  }
}
