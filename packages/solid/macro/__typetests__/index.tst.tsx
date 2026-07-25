/** @jsxImportSource solid-js */

import type { Accessor, JSX } from "solid-js"
import type { I18n } from "@lingui/core"
import { ph } from "@lingui/core/macro"
import { expect, test } from "tstyche"

import {
  Plural,
  Select,
  SelectOrdinal,
  Trans,
  useLingui,
} from "@lingui/solid/macro"

const gender = "male"
const user = {
  name: "John",
}
let m: JSX.Element

///////////////////
//// JSX Trans
///////////////////

m = <Trans>Message</Trans>
m = (
  <Trans id="custom.id" comment="comment" context="context">
    Message
  </Trans>
)

// @ts-expect-error: Property 'children' is missing in type
m = <Trans id="custom.id" comment="comment" context="context" />

m = <Trans>Hello {{ username: user.name }}</Trans>

m = (
  <Trans>
    Hello <strong>{ph({ name: user.name })}</strong>
  </Trans>
)
m = (
  <Trans>
    Hello <strong>{user.name}</strong>
  </Trans>
)
m = (
  <Trans>
    {/* @ts-expect-error: 'name' does not exist in type */}
    Hello <strong>{{ name: user.name }}</strong>
  </Trans>
)

///////////////////
//// JSX Plural
///////////////////

m = (
  // @ts-expect-error: Property 'children' does not exist on type
  <Plural value={5} other={"..."}>
    Message
  </Plural>
)

// @ts-expect-error: Type '{}' is not assignable to type 'IntrinsicAttributes & PluralChoiceProps'
m = <Plural />

m = <Plural value={5} offset={1} one={"..."} other={"..."} _0="" _1={"..."} />

// @ts-expect-error: Type 'string' is not assignable to type 'number'
m = <Plural value={5} offset={"1"} one={"..."} other={"..."} />

// @ts-expect-error: Property 'unsupported' does not exist on type
m = <Plural value={5} unsupported={"should be error"} />

// should support JSX element as Props
m = <Plural value={5} one={<Trans>...</Trans>} other={<Trans>...</Trans>} />

// value as string
m = <Plural value={"5"} one={"..."} other={"..."} />

// with labeled value
m = <Plural value={{ count: 5 }} one={"..."} other={"..."} />

// @ts-expect-error: Property 'other' is missing in type
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
//// JSX SelectOrdinal is the same as Plural, so just smoke test it
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
  // @ts-expect-error: Property 'children' does not exist on type
  <Select value={gender} other={"string"}>
    Message
  </Select>
)

// @ts-expect-error: Type 'number' is not assignable to type 'string | LabeledExpression<string | number>'
m = <Select value={5} other={"string"} />

// @ts-expect-error: Property 'other' is missing in type
m = <Select value={"male"} />

// @ts-expect-error: Property 'value' is missing in type
m = <Select other={"male"} />

m = <Select value={gender} _male="..." _female="..." other={"..."} />

// @ts-expect-error: Property 'male' does not exist on type
m = <Select value={gender} male="..." female=".." other={"..."} />

m = <Select value={{ gender }} _male="..." _female=".." other={"..."} />

// should support JSX in props
m = (
  <Select
    value={"male"}
    _male={<Trans>...</Trans>}
    other={<Trans>...</Trans>}
  />
)

test("useLingui", () => {
  const { t, i18n } = useLingui()

  expect(t`Hello world`).type.toBe<string>()
  expect(t({ message: "my message" })).type.toBe<string>()
  expect(t).type.not.toBeCallableWith(i18n)

  expect(i18n).type.toBe<Accessor<I18n>>()
})
