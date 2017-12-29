if (process.env.NODE_ENV === "production") {
  module.exports = require("./cjs/lingui-i18n.production.min.js")
} else {
  module.exports = require("./cjs/lingui-i18n.development.js")
}
