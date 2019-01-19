import { createMacro, MacroError } from "babel-plugin-macros"
import MacroJS from "./macroJs"

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
    case "plural":
    case "select":
    case "selectOrdinal":
    case "number":
    case "date":
      return "js"
    case "Trans":
    case "Plural":
    case "Select":
    case "SelectOrdinal":
    case "NumberFormat":
    case "DateFormat":
      return "jsx"
  }
}

export default createMacro(macro)
