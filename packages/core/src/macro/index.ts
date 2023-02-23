import { createMacro, MacroParams } from "babel-plugin-macros"
import { getConfig as loadConfig, LinguiConfigNormalized } from "@lingui/conf"

import { MacroJs } from "./macroJs"
import type { NodePath } from "@babel/traverse"
import {
  addImport,
  isRootPath,
  throwNonMacroContextError,
} from "@lingui/macro-lib"

export type LinguiMacroOpts = {
  // explicitly set by CLI when running extraction process
  extract?: boolean
  linguiConfig?: LinguiConfigNormalized
}

export const jsMacroTags = new Set([
  "defineMessage",
  "arg",
  "t",
  "plural",
  "select",
  "selectOrdinal",
])

let config: LinguiConfigNormalized

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

  const { i18nImportModule, i18nImportName } = getConfig(
    opts.linguiConfig
  ).runtimeConfigModule

  const jsNodes = new Set<NodePath>()
  let needsI18nImport = false

  Object.keys(references).forEach((tagName) => {
    const nodes = references[tagName]

    if (jsMacroTags.has(tagName)) {
      nodes.forEach((node) => {
        jsNodes.add(node.parentPath)
      })
    }
    // else {
    //   throw nodes[0].buildCodeFrameError(`Unknown macro ${tagName}`)
    // }
  })

  const stripNonEssentialProps =
    process.env.NODE_ENV == "production" && !opts.extract

  const jsNodesArray = Array.from(jsNodes)

  jsNodesArray.filter(isRootPath(jsNodesArray)).forEach((path) => {
    const macro = new MacroJs(babel, { i18nImportName, stripNonEssentialProps })
    if (macro.replacePath(path)) needsI18nImport = true
  })

  if (needsI18nImport) {
    addImport(
      babel.types,
      state.file.path.node,
      i18nImportModule,
      i18nImportName
    )
  }
}

;[...jsMacroTags].forEach((name) => {
  Object.defineProperty(module.exports, name, {
    get() {
      throwNonMacroContextError("@lingui/core/macro")
    },
  })
})

export default createMacro(macro, {
  configName: "lingui",
})

export * from "./types"
