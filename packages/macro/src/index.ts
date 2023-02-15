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

export type LinguiMacroOpts = {
  // explicitly set by CLI when running extraction process
  extract?: boolean
}

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

function macro({ references, state, babel, config }: MacroParams) {
  const opts: LinguiMacroOpts = config as LinguiMacroOpts

  const jsxNodes = new Set<NodePath>()
  const jsNodes = new Set<NodePath>()
  let needsI18nImport = false

  Object.keys(references).forEach((tagName) => {
    const nodes = references[tagName]

    if (jsMacroTags.has(tagName)) {
      nodes.forEach((node) => {
        jsNodes.add(node.parentPath)
      })
    } else if (jsxMacroTags.has(tagName)) {
      // babel-plugin-macros return JSXIdentifier nodes.
      // Which is for every JSX element would be presented twice (opening / close)
      // Here we're taking JSXElement and dedupe it.
      nodes.forEach((node) => {
        // identifier.openingElement.jsxElement
        jsxNodes.add(node.parentPath.parentPath)
      })
    } else {
      throw nodes[0].buildCodeFrameError(`Unknown macro ${tagName}`)
    }
  })

  const stripNonEssentialProps =
    process.env.NODE_ENV == "production" && !opts.extract

  const jsNodesArray = Array.from(jsNodes)

  jsNodesArray.filter(isRootPath(jsNodesArray)).forEach((path) => {
    const macro = new MacroJS(babel, { i18nImportName, stripNonEssentialProps })
    if (macro.replacePath(path)) needsI18nImport = true
  })

  const jsxNodesArray = Array.from(jsxNodes)

  jsxNodesArray.filter(isRootPath(jsxNodesArray)).forEach((path) => {
    const macro = new MacroJSX(babel, { stripNonEssentialProps })
    macro.replacePath(path)
  })

  if (needsI18nImport) {
    addImport(babel, state, i18nImportModule, i18nImportName)
  }

  if (jsxNodes.size) {
    addImport(babel, state, TransImportModule, TransImportName)
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

/**
 * Filtering nested macro calls
 *
 * <Macro>
 *   <Macro /> <-- this would be filtered out
 * </Macro>
 */
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

export default createMacro(macro, {
  configName: "lingui",
})
