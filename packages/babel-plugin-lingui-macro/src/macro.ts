import type { VisitNodeObject } from "@babel/traverse"
import { Program } from "@babel/types"

import linguiPlugin from "./index"
import * as Babel from "@babel/core"

interface MacroParams {
  state: Babel.PluginPass
  babel: typeof Babel
  config?: { [key: string]: any } | undefined
}

let deprecationWarningShown = false

export function macro({ state, babel, config }: MacroParams) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true
    console.warn(
      `[@lingui/macro] Using Lingui macros via "babel-plugin-macros" is deprecated ` +
        `since v6 and will be removed in the next major version. ` +
        `Please migrate to the dedicated babel plugin "@lingui/babel-plugin-lingui-macro" ` +
        `or "@lingui/swc-plugin". ` +
        `See https://lingui.dev/installation?transpiler=babel#choosing-a-transpiler for installation instructions.`,
    )
  }

  if (!state.get("linguiProcessed")) {
    state.opts = config
    const plugin = linguiPlugin(babel)

    const { enter, exit } = plugin.visitor.Program as VisitNodeObject<
      any,
      Program
    >

    enter(state.file.path, state)
    state.file.path.traverse(plugin.visitor, state)
    exit(state.file.path, state)

    state.set("linguiProcessed", true)
  }

  return { keepImports: true }
}
