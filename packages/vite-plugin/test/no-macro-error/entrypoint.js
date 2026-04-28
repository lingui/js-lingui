import {
  t,
  msg,
  plural,
  defineMessage,
  ph,
  selectOrdinal,
  select,
} from "@lingui/core/macro"

import {
  useLingui,
  Plural,
  Select,
  SelectOrdinal,
  Trans,
} from "@lingui/react/macro"

export async function load() {
  console.log(msg, plural, defineMessage, ph, selectOrdinal, select)
  console.log(useLingui, Plural, Select, SelectOrdinal, Trans)
  return t`Ola`
}
