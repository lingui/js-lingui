export const t = function () {}
export const msg = function () {}
export const ph = function () {}
export const defineMessage = function () {}
export const plural = function () {}
export const select = function () {}
export const selectOrdinal = function () {}

throw new Error(
  `The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation. \n` +
    `This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro"`,
)
