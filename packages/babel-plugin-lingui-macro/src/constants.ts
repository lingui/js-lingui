export const EXTRACT_MARK = "i18n"
export const MACRO_LEGACY_PACKAGE = "@lingui/macro"
export const MACRO_CORE_PACKAGE = "@lingui/core/macro"
export const MACRO_REACT_PACKAGE = "@lingui/react/macro"

export enum MsgDescriptorPropKey {
  id = "id",
  message = "message",
  comment = "comment",
  values = "values",
  components = "components",
  context = "context",
}

export enum JsMacroName {
  t = "t",
  plural = "plural",
  select = "select",
  selectOrdinal = "selectOrdinal",
  msg = "msg",
  defineMessage = "defineMessage",
  useLingui = "useLingui",
}

export enum JsxMacroName {
  Trans = "Trans",
  Plural = "Plural",
  Select = "Select",
  SelectOrdinal = "SelectOrdinal",
}
