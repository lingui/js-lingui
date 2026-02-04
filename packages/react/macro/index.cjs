const { createMacro } = require("babel-plugin-macros")
const { macro } = require("@lingui/babel-plugin-lingui-macro/macro")

export default createMacro(macro, {
  configName: "lingui",
})
