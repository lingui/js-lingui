if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/lingui-react.production.min.js")
} else {
  module.exports = require("./cjs/lingui-react.development.js")
}
