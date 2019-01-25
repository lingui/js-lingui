if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/dev.production.min.js")
} else {
  module.exports = require("./cjs/dev.development.js")
}
