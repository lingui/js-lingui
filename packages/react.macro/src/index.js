import { createMacro } from "babel-plugin-macros"
import Transformer from "@lingui/babel-plugin-transform-react/transformer"

const importsToCarryOver = ["DateFormat", "NumberFormat"]

function index({ references, state, babel }) {
  const { types: t } = babel
  const transformer = new Transformer(babel)

  const toKeepImports = ["Trans"]

  // Trick the plugin into thinking we've processed an import
  transformer.setImportDeclarations(
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

      transformer.transform({ node }, state.file)
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

const Trans = () => {}
const Plural = () => {}
const Select = () => {}
const SelectOrdinal = () => {}
const DateFormat = () => {}
const NumberFormat = () => {}

export default createMacro(index)
export { Trans, Plural, Select, SelectOrdinal, DateFormat, NumberFormat }
