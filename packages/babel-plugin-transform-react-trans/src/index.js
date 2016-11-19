export default function({ types: t }) {
  function isIdAttribute(node) {
    return t.isJSXAttribute(node) && t.isJSXIdentifier(node.name, {name: 'id'})
  }

  return {
    visitor: {
      JSXElement({ node }, state) {
        const text = node.children[0].value
        const attrs = node.openingElement.attributes

        // Don't add ID attribute if already exists
        if (attrs.some(isIdAttribute)) return

        attrs.push(
          t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(text))
        )
      },
    }
  }
}
