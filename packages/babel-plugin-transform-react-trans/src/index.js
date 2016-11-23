export default function({ types: t }) {
  function isIdAttribute(node) {
    return t.isJSXAttribute(node) && t.isJSXIdentifier(node.name, {name: 'id'})
  }

  function cleanChildren(node) {
    node.children = []
    node.openingElement.selfClosing = true
  }

  return {
    visitor: {
      JSXElement({ node }, state) {
        const attrs = node.openingElement.attributes
        const children = node.children

        cleanChildren(node)

        // Don't add ID attribute if already exists
        if (attrs.some(isIdAttribute)) return

        let text = ""
        let params = []

        for (const child of children) {
          if (t.isJSXText(child)) {
            text += child.value

          } else if (t.isJSXExpressionContainer(child)) {
            const exp = child.expression

            if (t.isIdentifier(exp)) {
              text += `{${exp.name}}`
              params.push(t.objectProperty(exp, exp))

            } else {
              text += exp.value
            }
          }
        }

        attrs.push(
          t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(text))
        )

        if (params.length) {
          attrs.push(
            t.JSXAttribute(
              t.JSXIdentifier("params"),
              t.JSXExpressionContainer(t.objectExpression(params)))
          )
        }
      },
    }
  }
}
