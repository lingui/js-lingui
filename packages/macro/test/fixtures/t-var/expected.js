'use strict';

function scoped(foo) {
  if (foo) {
    var bar = 50;
    ( /*i18n*/{
      id: 'This is bar {bar}',
      values: {
        bar: bar
      }
    });
  } else {
    var _bar = 10;
    ( /*i18n*/{
      id: 'This is a different bar {bar}',
      values: {
        bar: _bar
      }
    });
  }
}