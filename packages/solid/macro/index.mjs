import babelPluginMacros from "babel-plugin-macros"
import { macro } from "@lingui/babel-plugin-lingui-macro/macro"

const { createMacro } = babelPluginMacros

export default createMacro(macro, {
  configName: "lingui",
})

function printError() {
  throw new Error(
    `The macro you imported from "@lingui/solid/macro" is being executed outside the context of compilation. \n` +
      `This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro" \n` +
      "Additionally, dynamic imports — e.g., `await import('@lingui/solid/macro')` — are not supported.",
  )
}

export const Trans = printError
export const Plural = printError
export const Select = printError
export const SelectOrdinal = printError
export const useLingui = printError
