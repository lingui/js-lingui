import { createMacro, MacroParams } from "babel-plugin-macros"
import { getConfig } from "@lingui/conf"

import MacroJS from "./macroJs"
import MacroJSX from "./macroJsx"
import { NodePath } from "@babel/traverse"
import {
  ImportDeclaration,
  isImportSpecifier,
  isIdentifier,
} from "@babel/types"

const config = getConfig({ configPath: process.env.LINGUI_CONFIG })

const getSymbolSource = (
  name: "i18n" | "Trans"
): [source: string, identifier?: string] => {
  if (Array.isArray(config.runtimeConfigModule)) {
    if (name === "i18n") {
      return config.runtimeConfigModule
    } else {
      return ["@lingui/react", name]
    }
  } else {
    if (config.runtimeConfigModule[name]) {
      return config.runtimeConfigModule[name]
    } else {
      return ["@lingui/react", name]
    }
  }
}

const [i18nImportModule, i18nImportName = "i18n"] = getSymbolSource("i18n")
const [TransImportModule, TransImportName = "Trans"] = getSymbolSource("Trans")

const jsMacroTags = new Set([
  "defineMessage",
  "arg",
  "t",
  "plural",
  "select",
  "selectOrdinal",
])

const jsxMacroTags = new Set(["Trans", "Plural", "Select", "SelectOrdinal"])

function macro({ references, state, babel }: MacroParams) {
  const jsxNodes: NodePath[] = []
  const jsNodes: NodePath[] = []
  let needsI18nImport = false

  Object.keys(references).forEach((tagName) => {
    const nodes = references[tagName]

    if (jsMacroTags.has(tagName)) {
      nodes.forEach((node) => {
        jsNodes.push(node.parentPath)
      })
    } else if (jsxMacroTags.has(tagName)) {
      nodes.forEach((node) => {
        // identifier.openingElement.jsxElement
        jsxNodes.push(node.parentPath.parentPath)
      })
    } else {
      throw nodes[0].buildCodeFrameError(`Unknown macro ${tagName}`)
    }
  })

  jsNodes.filter(isRootPath(jsNodes)).forEach((path) => {
    if (alreadyVisited(path)) return
    const macro = new MacroJS(babel, { i18nImportName })
    if (macro.replacePath(path)) needsI18nImport = true
  })

  jsxNodes.filter(isRootPath(jsxNodes)).forEach((path) => {
    if (alreadyVisited(path)) return
    const macro = new MacroJSX(babel)
    macro.replacePath(path)
  })

  if (needsI18nImport) {
    addImport(babel, state, i18nImportModule, i18nImportName)
  }

  if (jsxNodes.length) {
    addImport(babel, state, TransImportModule, TransImportName)
  }

  if (process.env.LINGUI_EXTRACT === "1") {
    return {
      keepImports: true,
    }
  }
}

function addImport(
  babel: MacroParams["babel"],
  state: MacroParams["state"],
  module: string,
  importName: string
) {
  const { types: t } = babel

  const linguiImport = state.file.path.node.body.find(
    (importNode) =>
      t.isImportDeclaration(importNode) &&
      importNode.source.value === module &&
      // https://github.com/lingui/js-lingui/issues/777
      importNode.importKind !== "type"
  ) as ImportDeclaration

  const tIdentifier = t.identifier(importName)
  // Handle adding the import or altering the existing import
  if (linguiImport) {
    if (
      linguiImport.specifiers.findIndex(
        (specifier) =>
          isImportSpecifier(specifier) &&
          isIdentifier(specifier.imported, { name: importName })
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

function isRootPath(allPath: NodePath[]) {
  return (node: NodePath) =>
    (function traverse(path): boolean {
      if (!path.parentPath) {
        return true
      } else {
        return !allPath.includes(path.parentPath) && traverse(path.parentPath)
      }
    })(node)
}

const alreadyVisitedCache = new WeakSet()
const alreadyVisited = (path: NodePath) => {
  if (alreadyVisitedCache.has(path)) {
    return true
  } else {
    alreadyVisitedCache.add(path)
    return false
  }
}

;[...jsMacroTags, ...jsxMacroTags].forEach((name) => {
  Object.defineProperty(module.exports, name, {
    get() {
      throw new Error(
        `The macro you imported from "@lingui/macro" is being executed outside the context of compilation with babel-plugin-macros. ` +
          `This indicates that you don't have the babel plugin "babel-plugin-macros" configured correctly. ` +
          `Please see the documentation for how to configure babel-plugin-macros properly: ` +
          "https://github.com/kentcdodds/babel-plugin-macros/blob/main/other/docs/user.md"
      )
    },
  })
})

export default createMacro(macro)
