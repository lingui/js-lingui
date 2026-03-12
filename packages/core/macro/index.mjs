import babelPluginMacros from "babel-plugin-macros"
import { macro } from "@lingui/babel-plugin-lingui-macro/macro"

const { createMacro } = babelPluginMacros

export default createMacro(macro, {
  configName: "lingui",
})

// the following shims for the case when this import used by nodejs code without transpilation
function printError() {
  throw new Error(
    `The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation. \n` +
      `This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro"`,
  )
}

export const t = printError
export const msg = printError
export const ph = printError
export const defineMessage = printError
export const plural = printError
export const select = printError
export const selectOrdinal = printError
