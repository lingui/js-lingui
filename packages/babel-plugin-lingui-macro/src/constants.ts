export const EXTRACT_MARK = "i18n"

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
  arg = "arg",
  useLingui = "useLingui",
  ph = "ph",
}

export enum JsxMacroName {
  Trans = "Trans",
  Plural = "Plural",
  Select = "Select",
  SelectOrdinal = "SelectOrdinal",
}
