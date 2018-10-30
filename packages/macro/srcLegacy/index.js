import { createMacro, MacroError } from "babel-plugin-macros"
import makeJsTransformer from "./js"
import JSXTransformer from "./jsx"

function macro({ references, state, babel }) {
  const { types: t } = babel

  const transformer = makeJsTransformer(babel)
  const jsxTransformer = new JSXTransformer(babel)
  const reactImportsToCarryOver = ["DateFormat", "NumberFormat"]
  const reactImports = []

  Object.keys(references).forEach(tagName => {
    const tags = references[tagName]
    const macroType = getMacroType(tagName)

    if (macroType === "jsx") {
      if (!reactImports.includes("Trans")) {
        reactImports.push("Trans")
      }

      if (reactImportsToCarryOver.includes(tagName)) {
        reactImports.push(tagName)
      }

      // Trick the plugin into thinking we've processed an import
      jsxTransformer.setImportDeclarations(
        Object.keys(references).reduce((obj, key) => {
          if (key !== "default" || key !== "Trans") obj[key] = key
          return obj
        }, {})
      )

      tags.forEach(openingTag => {
        if (!t.isJSXOpeningElement(openingTag.container)) return // Exclude closing elements

        const node = openingTag.context.parentPath.container

        jsxTransformer.transform({ node }, state.file)
      })
    } else {
      tags.forEach(tag => {
        let expression = tag.parentPath

        if (tagName === "t" && t.isCallExpression(expression)) {
          expression = expression.parentPath
        }

        transformer(expression, state.file)
      })
    }
  })

  addLinguiReactImports(babel, state, reactImports)
  //
  // if (process.env.LINGUI_EXTRACT === "1") {
  //   return {
  //     keepImports: true
  //   }
  // }
}
//
// function getMacroType(tagName) {
//   switch (tagName) {
//     case "t":
//     case "plural":
//     case "select":
//     case "selectOrdinal":
//     case "number":
//     case "date":
//       return "js"
//     case "Trans":
//     case "Plural":
//     case "Select":
//     case "SelectOrdinal":
//     case "NumberFormat":
//     case "DateFormat":
//       return "jsx"
//   }
// }

function addLinguiReactImports(babel, state, imports) {
  if (!imports.length) return

  const { types: t } = babel

  const linguiReactImport = state.file.path.node.body.find(
    importNode =>
      t.isImportDeclaration(importNode) &&
      importNode.source.value === "@lingui/react"
  )

  // Handle adding the import or altering the existing import
  if (linguiReactImport) {
    imports.forEach(name => {
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
        imports.map(name =>
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

const t = () => {}
const plural = () => {}
const select = () => {}
const selectOrdinal = () => {}
const date = () => {}
const number = () => {}

export { Trans, Plural, Select, SelectOrdinal, DateFormat, NumberFormat }
export { t, plural, select, selectOrdinal, date, number }

export default createMacro(macro)
