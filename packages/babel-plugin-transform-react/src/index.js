export { default as implementationPlugin } from "./implementationPlugin"
import implementationPlugin from "./implementationPlugin"

// Plugin function
export default function(babel) {
  const { types: t } = babel

  const plugin = new implementationPlugin(babel)

  return {
    pre() {
      // Reset import declaration for each file.
      // Regression introduced in https://github.com/lingui/js-lingui/issues/62
      plugin.setImportDeclarations({})
    },
    visitor: {
      ImportDeclaration(path) {
        const importDeclarations = plugin.getImportDeclarations()
        const { node } = path

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
              t.identifier(plugin.getLocalImportName("Trans")),
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

        plugin.setImportDeclarations(importDeclarations)
      },

      JSXElement(path, file) {
        plugin.JSXElement(path, file)
      }
    } // visitor
  }
}
