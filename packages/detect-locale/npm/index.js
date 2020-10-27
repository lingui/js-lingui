if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/detect-locale.production.min.js")
} else {
  module.exports = require("./cjs/detect-locale.development.js")
}
