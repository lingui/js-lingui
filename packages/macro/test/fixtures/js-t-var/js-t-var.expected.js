"use strict";

var _core = require("@lingui/core");

function scoped(foo) {
  if (foo) {
    var bar = 50;

    /*i18n*/
    _core.i18n._("This is bar {bar}", {
      bar: bar
    });
  } else {
    var _bar = 10;

    /*i18n*/
    _core.i18n._("This is a different bar {bar}", {
      bar: _bar
    });
  }
}
