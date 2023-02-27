import { expectType } from "tsd"
import type { MessageDescriptor, I18n } from "@lingui/core"

import {
  t,
  defineMessage,
  plural,
  selectOrdinal,
  select,
  Trans,
  Plural,
  Select,
  SelectOrdinal,
} from "."
// eslint-disable-next-line import/no-extraneous-dependencies
import React from "react"

const name = "Jack"
const i18n: I18n = null

// simple
expectType<string>(t`Hello world`)
expectType<string>(t`Hello ${name}`)

// with custom i18n
expectType<string>(t(i18n)`With custom i18n instance`)
expectType<string>(t(i18n)`With custom i18n instance ${name}`)

// with macro message descriptor
expectType<string>(
  t({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)

// only id
expectType<string>(t({ id: "custom.id" }))

// only message
expectType<string>(t({ message: "my message" }))

// @ts-expect-error no id or message
t({ comment: "", context: "" })

// @ts-expect-error id or message should be presented
t({})

// @ts-expect-error `values` is invalid field for macro message descriptor
t({
  id: "custom.id",
  comment: "Hello",
  context: "context",
  message: "Hello world",

  values: {},
})

// message descriptor + custom i18n
expectType<string>(
  t(i18n)({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)

expectType<MessageDescriptor>(
  defineMessage({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)

// @ts-expect-error id or message should be presented
expectType<MessageDescriptor>(defineMessage({}))

///////////////////
//// Plural  //////
///////////////////

expectType<string>(
  plural("5", {
    // @ts-expect-error extra properties are not allowed
    incorrect: "",

    one: "...",
    other: "...",
    few: "...",
    many: "...",
    zero: "...",
  })
)

expectType<string>(
  plural(5, {
    one: "...",
    other: "...",
  })
)

// with offset
expectType<string>(
  plural(5, {
    one: "...",
    other: "...",
    offset: 5,
  })
)

// exact choices
expectType<string>(
  plural(5, {
    0: "...",
    1: "...",
    one: "...",
    other: "...",
  })
)

expectType<string>(
  plural(5, {
    // @ts-expect-error: should accept only strings
    one: 5,
    // @ts-expect-error: should accept only strings
    other: 5,
  })
)

///////////////////
//// Select Ordinal
///////////////////

expectType<string>(
  selectOrdinal("5", {
    // @ts-expect-error extra properties are not allowed
    incorrect: "",

    one: "...",
    other: "...",
    few: "...",
    many: "...",
    zero: "...",
  })
)

expectType<string>(
  selectOrdinal(5, {
    one: "...",
    other: "...",
  })
)

// with offset
expectType<string>(
  selectOrdinal("5", {
    one: "...",
    other: "...",
    offset: 5,
  })
)

// exact choices
expectType<string>(
  selectOrdinal(5, {
    0: "...",
    1: "...",
    one: "...",
    other: "...",
  })
)

expectType<string>(
  selectOrdinal(5, {
    // @ts-expect-error: should accept only strings
    one: 5,
    // @ts-expect-error: should accept only strings
    other: 5,
  })
)

///////////////////
//// Select
///////////////////

const gender = "male"
expectType<string>(
  select(gender, {
    // todo: here is inconsistency between jsx macro and js.
    //   in JSX macro you should prefix exact choices with "_"
    //   but here is not. And it's better to use it with underscore,
    //   because this could be statically checked by TS
    //   type UnderscoreValue = `_${string}`;
    male: "he",
    female: "she",
    other: "they",
  })
)

expectType<string>(
  // @ts-expect-error value could be strings only
  select(5, {
    male: "he",
    female: "she",
    other: "they",
  })
)

expectType<string>(
  select("male", {
    // @ts-expect-error: should accept only strings
    male: 5,
    // @ts-expect-error: should accept only strings
    other: 5,
  })
)

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
