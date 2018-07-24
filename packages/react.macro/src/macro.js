import { createMacro } from "babel-plugin-macros"
import { implementationPlugin as TransformReactPlugin } from "@lingui/babel-plugin-transform-react"

const importsToCarryOver = ["DateFormat", "NumberFormat", "withI18n"]

function macro({ references, state, babel }) {
  const { types: t } = babel
  const plugin = new TransformReactPlugin(babel)

  const toKeepImports = ["Trans"]

  // Trick the plugin into thinking we've processed an import
  plugin.setImportDeclarations(
    Object.keys(references).reduce((obj, key) => {
      if (key !== "default" || key !== "Trans") obj[key] = key
      return obj
    }, {})
  )

  for (let [tagName, tags] of Object.entries(references)) {
    if (importsToCarryOver.includes(tagName)) toKeepImports.push(tagName)

    tags.forEach(openingTag => {
      if (!t.isJSXOpeningElement(openingTag.container)) return // Exclude closing elements

      const node = openingTag.context.parentPath.container

      plugin.JSXElement({ node }, state.file)
    })
  }

  const linguiReactImport = state.file.path.node.body.find(
    importNode =>
      t.isImportDeclaration(importNode) &&
      importNode.source.value === "@lingui/react"
  )

  // Handle adding the import or altering the existing import
  if (linguiReactImport) {
    toKeepImports.forEach(name => {
      if (
        linguiReactImport.specifiers.findIndex(
          specifier => specifier.imported && specifier.imported.name === name
        ) === -1
      ) {
        linguiReactImport.specifiers.push(
          t.importSpecifier(t.identifier(name), t.identifier(name))
        )
      }
    })
  } else {
    state.file.path.node.body.unshift(
      t.importDeclaration(
        toKeepImports.map(name =>
          t.importSpecifier(t.identifier(name), t.identifier(name))
        ),
        t.stringLiteral("@lingui/react")
      )
    )
  }
}

export default createMacro(macro)
// For intellisense as these will be ignored by babel-macro
// Might want to copy PropTypes here?
export const Trans = () => {}
export const Plural = () => {}
export const Select = () => {}
export const SelectOrdinal = () => {}
export const DateFormat = () => {}
export const NumberFormat = () => {}
