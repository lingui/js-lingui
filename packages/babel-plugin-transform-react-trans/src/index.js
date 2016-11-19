export default function({ types: t }) {
  return {
    visitor: {
      JSXElement({ node }, state) {
        const text = node.children[0].value

        node.openingElement.attributes.push(
          t.JSXAttribute(t.JSXIdentifier("id"), t.StringLiteral(text))
        )
      },
    }
  }
}
