import { createMacro } from "babel-plugin-macros"
import MacroJS from "./macroJs"
import MacroJSX from "./macroJsx"

function macro({ references, state, babel }) {
  const jsxNodes = []
  const jsNodes = []

  Object.keys(references).forEach(tagName => {
    const nodes = references[tagName]
    const macroType = getMacroType(tagName)

    if (macroType === "js") {
      nodes.forEach(node => {
        jsNodes.push(node.parentPath)
      })
    } else {
      nodes.forEach(node => {
        // identifier.openingElement.jsxElement
        jsxNodes.push(node.parentPath.parentPath)
      })
    }
  })

  jsNodes.filter(isRootPath(jsNodes)).forEach(path => {
    if (alreadyVisited(path)) return
    const macro = new MacroJS(babel)
    macro.replacePath(path)
  })

  jsxNodes.filter(isRootPath(jsxNodes)).forEach(path => {
    if (alreadyVisited(path)) return
    const macro = new MacroJSX(babel)
    macro.replacePath(path)
  })

  if (jsxNodes.length) {
    addImport(babel, state, "@lingui/react", "Trans")
  }

  if (jsNodes && Object.keys(references).includes("defineMessages")) {
    addImport(babel, state, "@lingui/core", "Messages")
  }

  if (process.env.LINGUI_EXTRACT === "1") {
    return {
      keepImports: true
    }
  }
}

function addImport(babel, state, module, importName) {
  const { types: t } = babel

  const linguiImport = state.file.path.node.body.find(
    importNode =>
      t.isImportDeclaration(importNode) && importNode.source.value === module
  )

  const tIdentifier = t.identifier(importName)
  // Handle adding the import or altering the existing import
  if (linguiImport) {
    if (
      linguiImport.specifiers.findIndex(
        specifier =>
          specifier.imported && specifier.imported.name === importName
      ) === -1
    ) {
      linguiImport.specifiers.push(t.importSpecifier(tIdentifier, tIdentifier))
    }
  } else {
    state.file.path.node.body.unshift(
      t.importDeclaration(
        [t.importSpecifier(tIdentifier, tIdentifier)],
        t.stringLiteral(module)
      )
    )
  }
}

function isRootPath(allPath) {
  return node =>
    (function traverse(path) {
      if (!path.parentPath) {
        return true
      } else {
        return !allPath.includes(path.parentPath) && traverse(path.parentPath)
      }
    })(node)
}

const alreadyVisitedCache = []

function alreadyVisited(path) {
  if (alreadyVisitedCache.includes(path)) {
    return true
  } else {
    alreadyVisitedCache.push(path)
    return false
  }
}

function getMacroType(tagName) {
  switch (tagName) {
    case "defineMessages":
    case "t":
    case "plural":
    case "select":
    case "selectOrdinal":
      return "js"
    case "Trans":
    case "Plural":
    case "Select":
    case "SelectOrdinal":
      return "jsx"
  }
}

export default createMacro(macro)
