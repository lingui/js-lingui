import { expectType } from "tsd"
import type { I18n } from "@lingui/core"

import {
  Trans,
  Plural,
  Select,
  SelectOrdinal,
  useLingui,
} from "@lingui/react/macro"
import React from "react"

const gender = "male"
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

////////////////////////
//// React useLingui()
////////////////////////
function MyComponent() {
  const { t, i18n } = useLingui()

  expectType<string>(t`Hello world`)
  expectType<string>(t({ message: "my message" }))
  // @ts-expect-error: you could not pass a custom instance here
  t(i18n)({ message: "my message" })

  expectType<I18n>(i18n)
}
