var transformJs = require("@lingui/babel-plugin-transform-js").default

module.exports = function(context, opts) {
  return {
    plugins: [transformJs]
  }
}
