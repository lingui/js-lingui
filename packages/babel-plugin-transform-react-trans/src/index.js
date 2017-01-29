export default function({ types: t }) {
  function isIdAttribute(node) {
    return t.isJSXAttribute(node) && t.isJSXIdentifier(node.name, {name: 'id'})
  }

  const isElementFactory = name => node =>
    t.isJSXElement(node) && t.isJSXIdentifier(node.openingElement.name, { name })

  const isTransElement = isElementFactory('Trans')

  function cleanChildren(node) {
    node.children = []
    node.openingElement.selfClosing = true
  }

  function extract(node) {
    let text = '',
      params = {},
      components = []

    if (t.isJSXExpressionContainer(node)) {
      const exp = node.expression

      if (t.isIdentifier(exp)) {
        text += `{${exp.name}}`
        params[exp.name] = t.objectProperty(exp, exp)

      } else if (t.isTemplateLiteral(exp)) {
        let parts = []

        exp.quasis.forEach((item, index) => {
          parts.push(item)

          if (!item.tail) parts.push(exp.expressions[index])
        })

        parts.forEach((item) => {
          if (t.isTemplateElement(item)) {
            text += item.value.raw
          } else {
            text += `{${item.name}}`
            params[item.name] = t.objectProperty(item, item)
          }
        })

      } else {
        text += exp.value
      }

    } else if (t.isJSXElement(node)) {
      const index = this.inlineElementCounter++
      const selfClosing = node.openingElement.selfClosing

      text += !selfClosing ? `<${index}>` : `<${index}/>`

      for (const child of node.children) {
        const {
          text: newText, params: newParams, components: newComponents
        } = extract.bind(this)(child)

        text += newText
        params = Object.assign({}, params, newParams)
        components = components.concat(newComponents)
      }

      if (!selfClosing) text += `</${index}>`

      cleanChildren(node)
      components.unshift(node)

    } else if (t.isJSXSpreadChild(node)) {
      // TODO: I don't have a clue what's the usecase

    } else {
      text += node.value
    }

    // normalize spaces
    text = text.replace(/\n\s+/g, "\n")

    return { text, params, components }
  }

  return {
    visitor: {
      JSXElement({ node }) {
        if (!isTransElement(node)) return

        this.inlineElementCounter = 0
        const attrs = node.openingElement.attributes
        const children = node.children

        // 1. Collect all parameters and inline elements and generate message ID

        let text = "",
          params = {},
          components = []

        for (const child of children) {
          const {
            text: newText, params: newParams, components: newComponents
          } = extract.bind(this)(child)

          text += newText
          params = Object.assign({}, params, newParams)
          components = components.concat(newComponents)
        }

        // 2. Replace children and add collected data

        cleanChildren(node)
        text = text.trim()

        // If `id` prop already exists and generated ID is different,
        // add it as a `default` prop
        const idAttr = attrs.filter(isIdAttribute)[0]
        if (idAttr && idAttr.value.value !== text) {
          attrs.push(
            t.JSXAttribute(t.JSXIdentifier("defaults"), t.StringLiteral(text))
          )
        } else if (!idAttr) {
          attrs.push(
            t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(text))
          )
        }

        // Parameters for variable substitution
        const paramsList = Object.values(params)
        if (paramsList.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier("params"),
              t.JSXExpressionContainer(t.objectExpression(paramsList)))
          )
        }

        // Inline elements
        if (components.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier("components"),
              t.JSXExpressionContainer(t.arrayExpression(components))
            )
          )
        }
      }
    }
  }
}
