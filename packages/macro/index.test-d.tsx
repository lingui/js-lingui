import {
  defineMessage,
  plural,
  Plural,
  select,
  Select,
  selectOrdinal,
  SelectOrdinal,
  t,
  Trans,
} from "."
// eslint-disable-next-line import/no-extraneous-dependencies
import React from "react"

t`Hello world`
defineMessage({
  id: "custom.id",
  comment: "Hello",
  context: "context",
  message: "Hello world",
})

plural(5, {
  one: "...",
  other: "...",
})

selectOrdinal(5, {
  one: "...",
  other: "...",
})

const gender = "male"

select(gender, {
  male: "he",
  female: "she",
  other: "they",
})

// @ts-expect-error: is never read
let m: any

///////////////////
//// JSX
///////////////////

m = <Trans>Message</Trans>

m = <Plural value={5} other={"..."} />

m = (
  <SelectOrdinal
    value={5}
    offset={1}
    one={"..."}
    other={"..."}
    _0=""
    _1={"..."}
  />
)

m = <Select value={gender} _male="..." _female="..." other={"..."} />
