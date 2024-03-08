import { createMacro, MacroParams } from "babel-plugin-macros"

import { VisitNodeObject } from "@babel/traverse"
import { Program } from "@babel/types"

import linguiPlugin from "./index"
import { JsMacroName, JsxMacroName } from "./constants"

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

;[
  JsMacroName.defineMessage,
  JsMacroName.msg,
  JsMacroName.t,
  JsMacroName.useLingui,
  JsMacroName.plural,
  JsMacroName.select,
  JsMacroName.selectOrdinal,

  JsxMacroName.Trans,
  JsxMacroName.Plural,
  JsxMacroName.Select,
  JsxMacroName.SelectOrdinal,
].forEach((name) => {
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
}) as { isBabelMacro: true }
