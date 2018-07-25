const stripAnsi = require("strip-ansi")

module.exports = {
  test: val => typeof val === "string",
  print: val => stripAnsi(val)
}
