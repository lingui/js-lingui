import { t, selectOrdinal } from '@lingui/macro'

t`This is my ${selectOrdinal({
  value: count,
  one: "#st",
  "two": `#nd`,
  other: ("#rd")
})} cat`
