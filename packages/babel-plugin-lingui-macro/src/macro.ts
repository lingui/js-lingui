import { createMacro, MacroParams } from "babel-plugin-macros"

import type { VisitNodeObject } from "@babel/traverse"
import { Program } from "@babel/types"

import linguiPlugin from "./index"

function macro({ state, babel, config }: MacroParams) {
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

export default createMacro(macro, {
  configName: "lingui",
}) as { isBabelMacro: true }
