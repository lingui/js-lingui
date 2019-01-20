import { t } from '@lingui/macro'

t`This is my ${t.selectOrdinal({
  value: count,
  one: "#st",
  "two": `#nd`,
  other: ("#rd")
})} cat`
