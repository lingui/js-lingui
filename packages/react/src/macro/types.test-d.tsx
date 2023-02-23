import { Trans, Plural, Select, SelectOrdinal } from "./types"
import React from "react"

// @ts-expect-error: is never read
let m: any

///////////////////
//// JSX Trans
///////////////////

m = <Trans>Message</Trans>
m = (
  <Trans id="custom.id" comment="comment" context="context">
    Message
  </Trans>
)

// @ts-expect-error: children are required here
m = <Trans id="custom.id" comment="comment" context="context" />

///////////////////
//// JSX Plural
///////////////////
m = (
  // @ts-expect-error: children are not allowed
  <Plural value={5} other={"..."}>
    Message
  </Plural>
)

// @ts-expect-error: value is required
m = <Plural />

m = <Plural value={5} offset={1} one={"..."} other={"..."} _0="" _1={"..."} />

//  @ts-expect-error: offset could be number only
m = <Plural value={5} offset={"1"} one={"..."} other={"..."} />

// @ts-expect-error: not allowed prop is passed
m = <Plural value={5} unsupported={"should be error"} />

// should support JSX element as Props
m = <Plural value={5} one={<Trans>...</Trans>} other={<Trans>...</Trans>} />

// value as string
m = <Plural value={"5"} one={"..."} other={"..."} />

// @ts-expect-error: `other` should always be present
m = <Plural value={"5"} one={"..."} />

// additional properties
m = (
  <Plural
    value={5}
    comment={"Comment"}
    context={"Context"}
    id={"custom.id"}
    one={"..."}
    other={"..."}
  />
)

///////////////////
//// JSX SelectOrdinal is the same s Plural, so just smoke test it
///////////////////
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

///////////////////
//// JSX Select
///////////////////
const gender = "male"

m = (
  // @ts-expect-error: children are not allowed here
  <Select value={gender} other={"string"}>
    Message
  </Select>
)

// @ts-expect-error: `value` could be string only
m = <Select value={5} other={"string"} />

// @ts-expect-error: `other` required
m = <Select value={"male"} />

// @ts-expect-error: `value` required
m = <Select other={"male"} />

m = <Select value={gender} _male="..." _female="..." other={"..."} />

// @ts-expect-error: exact cases should be prefixed with underscore
m = <Select value={gender} male="..." female=".." other={"..."} />

// should support JSX in props
m = (
  <Select
    value={"male"}
    _male={<Trans>...</Trans>}
    other={<Trans>...</Trans>}
  />
)
