var transformJs = require("@lingui/babel-plugin-transform-js").default
var transformReact = require("@lingui/babel-plugin-transform-react").default

module.exports = function(context, opts) {
  return {
    plugins: [transformJs, transformReact]
  }
}
