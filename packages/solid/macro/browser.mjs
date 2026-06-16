export const Trans = function () {}
export const Plural = function () {}
export const Select = function () {}
export const SelectOrdinal = function () {}
export const useLingui = function () {}

throw new Error(
  `The macro you imported from "@lingui/solid/macro" is being executed outside the context of compilation. \n` +
    `This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro" \n` +
    "Additionally, dynamic imports — e.g., `await import('@lingui/solid/macro')` — are not supported.",
)
