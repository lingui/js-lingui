import { createMacro, MacroError } from "babel-plugin-macros"

function macro({ references, state, babel }) {
  Object.keys(references).forEach(tagName => {
    const tags = references[tagName]
    const macroType = getMacroType(tagName)

    if (macroType === "js") {
      tags.forEach(tag => {
        const macro = new Macro(babel)
        macro.replaceNode(tag.parentPath)
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
