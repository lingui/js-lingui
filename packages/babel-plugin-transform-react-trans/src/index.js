const pluralCategory = /(_\d+|zero|one|two|few|many|other)/
const pluralProps = /(value|offset|_\d+|zero|one|two|few|many|other)/

function cleanChildren(node) {
  node.children = []
  node.openingElement.selfClosing = true
}

const mergeProps = (props, nextProps) => ({
  text: props.text + nextProps.text,
  params: Object.assign({}, props.params, nextProps.params),
  components: props.components.concat(nextProps.components)
})

// Plugin function
export default function({ types: t }) {
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

  function extract(node, props) {
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
        const index = this.inlineElementCounter++
        const selfClosing = exp.openingElement.selfClosing

        nextProps.text += !selfClosing ? `<${index}>` : `<${index}/>`

        for (const child of exp.children) {
          nextProps = extract.call(this, child, nextProps)
        }

        if (!selfClosing) nextProps.text += `</${index}>`

        cleanChildren(exp)
        nextProps.components.unshift(exp)

      } else {
        nextProps.text += exp.value
      }

    } else if (t.isJSXElement(node)) {
      const index = this.inlineElementCounter++
      const selfClosing = node.openingElement.selfClosing

      nextProps.text += !selfClosing ? `<${index}>` : `<${index}/>`

      for (const child of node.children) {
        nextProps = extract.call(this, child, nextProps)
      }

      if (!selfClosing) nextProps.text += `</${index}>`

      cleanChildren(node)
      nextProps.components.unshift(node)

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
        this.inlineElementCounter = 0
        let attrs = node.openingElement.attributes
        const children = node.children

        // 1. Collect all parameters and inline elements and generate message ID

        let props = {
          text: "",
          params: {},
          components: []
        }

        if (isTransElement(node)) {
          for (const child of children) {
            props = extract.call(this, child, props)
          }

        } else if (isChooseElement(node)) {
          // TODO: Disallow children
          // TODO: Complain about missing pluralVariable
          // TODO: Type-check offset (must be number)

          const choicesType = node.openingElement.name.name.toLowerCase()
          const choices = {}
          let variable, offset = ''

          for (const attr of attrs) {
            const { name: { name } } = attr

            if (name === 'value') {
              const exp = attr.value.expression
              variable = exp.name
              props.params[variable] = t.objectProperty(exp, exp)

            } else if (choicesType !== 'select' && name === 'offset') {
              offset = ` offset:${attr.value.value}`

            } else {
              props = extract.call(this, attr.value, {
                text: '', params: props.params, components: props.components
              })
              choices[name.replace('_', '=')] = props.text
            }
          }

          const categories = Object.keys(choices).reduce((acc, key) => {
            return acc + ` ${key} {${choices[key]}}`
          }, '')

          props.text = `{${choicesType}, ${variable},${offset}${categories}}`
          attrs = attrs.filter(attr => attr.name.name === 'props')
          node.openingElement.name = t.JSXIdentifier('Trans')
        } else {

          // not an i18n element, skip it
          return
        }

        // 2. Replace children and add collected data

        cleanChildren(node)
        props.text = props.text.trim()

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

        node.openingElement.attributes = attrs
      }  // JSXElement
    }  // visitor
  }
}
