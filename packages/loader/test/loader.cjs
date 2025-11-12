const { createJiti } = require("jiti")
const jiti = createJiti(__filename)

module.exports = jiti("../src/webpackLoader.ts")
