import { createMacro, MacroError } from "babel-plugin-macros"
import MacroJS from "./macroJs"
import MacroJSX from "./macroJsx"

function macro({ references, state, babel }) {
  Object.keys(references).forEach(tagName => {
    const nodes = references[tagName]
    const macroType = getMacroType(tagName)

    if (macroType === "js") {
      nodes.forEach(node => {
        const macro = new MacroJS(babel)

        let macroNode = node.parentPath
        if (babel.types.isMemberExpression(macroNode)) {
          macroNode = macroNode.parentPath
        }
        macro.replaceNode(macroNode)
      })
    } else {
      nodes.forEach(node => {
        const macro = new MacroJSX(babel)

        // identifier.openingElement.jsxElement
        macro.replaceNode(node.parentPath.parentPath)
      })
    }
  })

  if (process.env.LINGUI_EXTRACT === "1") {
    return {
      keepImports: true
    }
  }
}

function getMacroType(tagName) {
  switch (tagName) {
    case "t":
      return "js"
    case "Trans":
    case "Plural":
    case "Select":
    case "SelectOrdinal":
      return "jsx"
  }
}

export default createMacro(macro)
