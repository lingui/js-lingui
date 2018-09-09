module.exports = require("./src")

function i18nClosure(id) {
  function t(args) {
    return this._(id, args)
  }
  t.id = id
  return t.bind(i18n)
}
