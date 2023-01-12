if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/compile.production.min.js")
} else {
  module.exports = require("./cjs/compile.development.js")
}
