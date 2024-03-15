import { i18n as _i18n } from "@lingui/core"
function scoped(foo) {
  if (foo) {
    const bar = 50
    _i18n._(
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
    const bar = 10
    _i18n._(
      /*i18n*/
      {
        id: "e6QGtZ",
        message: "This is a different bar {bar}",
        values: {
          bar: bar,
        },
      }
    )
  }
}
