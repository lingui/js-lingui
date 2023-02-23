import { createMacro, MacroParams } from "babel-plugin-macros"
import { jsMacroTags, macro as macroJs } from "@lingui/core/macro"
import { jsxMacroTags, macro as macroJsx } from "@lingui/react/macro"
import { throwNonMacroContextError } from "@lingui/macro-lib"

export default createMacro(
  (params: MacroParams) => {
    macroJs(params)
    macroJsx(params)
  },
  {
    configName: "lingui",
  }
)
;[...jsxMacroTags, ...jsMacroTags].forEach((name) => {
  Object.defineProperty(module.exports, name, {
    get() {
      throwNonMacroContextError("@lingui/macro")
    },
  })
})
