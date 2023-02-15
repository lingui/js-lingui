"use strict"

var _core = require("@lingui/core")
function scoped(foo) {
  if (foo) {
    var bar = 50
    _core.i18n._(
      /*i18n*/
      {
        id: "EvVtyn",
        message: "This is bar {bar}",
        values: {
          bar: bar,
        },
      }
    )
  } else {
    var _bar = 10
    _core.i18n._(
      /*i18n*/
      {
        id: "e6QGtZ",
        message: "This is a different bar {bar}",
        values: {
          bar: _bar,
        },
      }
    )
  }
}
