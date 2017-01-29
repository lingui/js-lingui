const pluralCategory = /(_\d+|zero|one|two|few|many|other)/
const pluralProps = /(value|offset|_\d+|zero|one|two|few|many|other)/

function cleanChildren(node) {
  node.children = []
  node.openingElement.selfClosing = true
}

const mergeProps = (props, nextProps) => ({
  text: props.text + nextProps.text,
  params: Object.assign({}, props.params, nextProps.params),
  components: props.components.concat(nextProps.components),
  elementIndex: nextProps.elementIndex
})

const elementGeneratorFactory = () => {
  let index = 0
  return () => index++
}


// Plugin function
export default function({ types: t }) {
  let elementGenerator

  function isIdAttribute(node) {
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

  function processElement(
    node,
    props = {
      text: "",
      params: {},
      components: []
    },
    root = false
  ) {
    const element = node.openingElement

    // Trans
    if (isTransElement(node)) {
      for (const child of node.children) {
        props = processChildren(child, props)
      }

    // Plural, Select, SelectOrdinal
    } else if (isChooseElement(node)) {
      // TODO: Disallow children
      // TODO: Complain about missing pluralVariable
      // TODO: Type-check offset (must be number)

      const choicesType = element.name.name.toLowerCase()
      const choices = {}
      let variable, offset = ''

      for (const attr of element.attributes) {
        const { name: { name } } = attr

        if (name === 'value') {
          const exp = attr.value.expression
          variable = exp.name
          props.params[variable] = t.objectProperty(exp, exp)

        } else if (choicesType !== 'select' && name === 'offset') {
          offset = ` offset:${attr.value.value}`

        } else {
          props = processChildren(attr.value, Object.assign({}, props, { text: '' }))
          choices[name.replace('_', '=')] = props.text
        }
      }

      const categories = Object.keys(choices).reduce((acc, key) => {
        return acc + ` ${key} {${choices[key]}}`
      }, '')

      props.text = `{${choicesType}, ${variable},${offset}${categories}}`
      element.attributes = element.attributes.filter(attr => attr.name.name === 'props')
      element.name = t.JSXIdentifier('Trans')

    // Other elements
    } else {
      if (root) return

      const index = elementGenerator()
      const selfClosing = node.openingElement.selfClosing

      props.text += !selfClosing ? `<${index}>` : `<${index}/>`

      for (const child of node.children) {
        props = processChildren(child, props)
      }

      if (!selfClosing) props.text += `</${index}>`

      cleanChildren(node)
      props.components.unshift(node)
    }

    return props
  }

  function processChildren(node, props) {
    let nextProps = {
      text: "",
      params: {},
      components: []
    }

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
        nextProps = processElement(exp, nextProps)

      } else {
        nextProps.text += exp.value
      }

    } else if (t.isJSXElement(node)) {
      nextProps = processElement(node, nextProps)

    } else if (t.isJSXSpreadChild(node)) {
      // TODO: I don't have a clue what's the usecase

    } else {
      nextProps.text += node.value
    }

    // normalize spaces
    nextProps.text = nextProps.text.replace(/\n\s+/g, "\n")

    return mergeProps(props, nextProps)
  }

  return {
    visitor: {
      JSXElement({ node }) {
        elementGenerator = elementGeneratorFactory()

        // 1. Collect all parameters and inline elements and generate message ID

        const props = processElement(node, props, /* root= */true)
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
            t.JSXAttribute(t.JSXIdentifier("defaults"), t.StringLiteral(props.text))
          )
        } else if (!idAttr) {
          attrs.push(
            t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(props.text))
          )
        }

        // Parameters for variable substitution
        const paramsList = Object.values(props.params)
        if (paramsList.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier("params"),
              t.JSXExpressionContainer(t.objectExpression(paramsList)))
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
      }  // JSXElement
    }  // visitor
  }
}
