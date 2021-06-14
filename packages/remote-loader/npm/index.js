if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/remote-loader.production.min.js")
} else {
  module.exports = require("./cjs/remote-loader.development.js")
}
