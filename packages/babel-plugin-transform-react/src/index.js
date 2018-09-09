import Transformer from "./transformer"

// Plugin function
export default function(babel) {
  const { types: t } = babel

  const transformer = new Transformer(babel)

  return {
    pre() {
      // Reset import declaration for each file.
      // Regression introduced in https://github.com/lingui/js-lingui/issues/62
      transformer.setImportDeclarations({})
    },
    visitor: {
      JSXElement: transformer.transform,
      ImportDeclaration({ node }) {
        const importDeclarations = transformer.getImportDeclarations()

        const moduleName = node.source.value
        if (moduleName !== "@lingui/react") return

        node.specifiers.forEach(specifier => {
          importDeclarations[specifier.imported.name] = specifier.local.name
        })

        // Choices components are converted to Trans,
        // so imports can be safely removed
        const choicesComponents = ["Plural", "Select", "SelectOrdinal"]
        const isChoiceComponent = specifier =>
          choicesComponents.includes(specifier.imported.name)

        const hasChoices = node.specifiers.filter(isChoiceComponent).length

        if (hasChoices) {
          node.specifiers = [
            // Import for `Trans` component should be there always
            t.importSpecifier(
              t.identifier(transformer.getLocalImportName("Trans")),
              t.identifier("Trans")
            ),

            // Copy all original imports except choices components
            // and duplicate Trans components
            ...node.specifiers.filter(
              specifier =>
                !isChoiceComponent(specifier) &&
                specifier.imported.name !== "Trans"
            )
          ]
        }

        transformer.setImportDeclarations(importDeclarations)
      }
    } // visitor
  }
}
