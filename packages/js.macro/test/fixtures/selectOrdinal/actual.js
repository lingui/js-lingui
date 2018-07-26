import { t, selectOrdinal } from '@lingui/js.macro'
const i18n = setupI18n();
t`This is my ${selectOrdinal({
  value: count,
  one: "#st",
  "two": `#nd`,
  other: ("#rd")
})} cat`
