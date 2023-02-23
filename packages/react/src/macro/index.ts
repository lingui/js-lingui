import { createMacro, MacroParams } from "babel-plugin-macros"
import { getConfig as loadConfig, LinguiConfigNormalized } from "@lingui/conf"

import { MacroJSX } from "./macroJsx"
import type { NodePath } from "@babel/traverse"
import {
  addImport,
  isRootPath,
  LinguiMacroOpts,
  throwNonMacroContextError,
} from "@lingui/macro-lib"

export const jsxMacroTags = new Set([
  "Trans",
  "Plural",
  "Select",
  "SelectOrdinal",
])

let config: LinguiConfigNormalized

// todo, make memoization on the conf library level
function getConfig(_config?: LinguiConfigNormalized) {
  if (_config) {
    config = _config
  }
  if (!config) {
    config = loadConfig()
  }
  return config
}

export function macro({ references, state, babel, config }: MacroParams) {
  const opts: LinguiMacroOpts = config as LinguiMacroOpts

  const { TransImportModule, TransImportName } = getConfig(
    opts.linguiConfig
  ).runtimeConfigModule

  const jsxNodes = new Set<NodePath>()

  Object.keys(references).forEach((tagName) => {
    const nodes = references[tagName]

    if (jsxMacroTags.has(tagName)) {
      // babel-plugin-macros return JSXIdentifier nodes.
      // Which is for every JSX element would be presented twice (opening / close)
      // Here we're taking JSXElement and dedupe it.
      nodes.forEach((node) => {
        // identifier.openingElement.jsxElement
        jsxNodes.add(node.parentPath.parentPath)
      })
    }
    // else {
    //   throw nodes[0].buildCodeFrameError(`Unknown macro ${tagName}`)
    // }
  })

  const stripNonEssentialProps =
    process.env.NODE_ENV == "production" && !opts.extract

  const jsxNodesArray = Array.from(jsxNodes)

  jsxNodesArray.filter(isRootPath(jsxNodesArray)).forEach((path) => {
    const macro = new MacroJSX(babel, { stripNonEssentialProps })
    macro.replacePath(path)
  })

  if (jsxNodes.size) {
    addImport(
      babel.types,
      state.file.path.node,
      TransImportModule,
      TransImportName
    )
  }
}

;[...jsxMacroTags].forEach((name) => {
  Object.defineProperty(module.exports, name, {
    get() {
      throwNonMacroContextError("@lingui/react/macro")
    },
  })
})

export default createMacro(macro, {
  configName: "lingui",
})

export * from "./types"
