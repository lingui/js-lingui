if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/core.production.min.js")
} else {
  module.exports = require("./cjs/core.development.js")
}
