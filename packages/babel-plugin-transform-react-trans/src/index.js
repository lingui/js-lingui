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
        const child = node.children[0]

        cleanChildren(node)

        // Don't add ID attribute if already exists
        if (attrs.some(isIdAttribute)) return

        let text
        if (t.isJSXText(child)) {
          text = child.value
        } else if (t.isJSXExpressionContainer(child)) {
          text = child.expression.value
        }

        attrs.push(
          t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(text))
        )
      },
    }
  }
}
