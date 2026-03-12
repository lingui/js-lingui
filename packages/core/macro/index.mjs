import babelPluginMacros from "babel-plugin-macros"
import { macro } from "@lingui/babel-plugin-lingui-macro/macro"

const { createMacro } = babelPluginMacros

export default createMacro(macro, {
  configName: "lingui",
})
