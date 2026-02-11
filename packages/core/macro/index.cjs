const { createMacro } = require("babel-plugin-macros")
const { macro } = require("@lingui/babel-plugin-lingui-macro/macro")

module.exports = createMacro(macro, {
  configName: "lingui",
})
