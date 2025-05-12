import { expectType } from "tsd"
import type { MessageDescriptor, I18n } from "@lingui/core"

import {
  t,
  defineMessage,
  msg,
  plural,
  selectOrdinal,
  select,
  ph,
} from "@lingui/core/macro"

const name = "Jack"
const user = { name: "Jack" }
const i18n: I18n = null
const numberValue = 2

// simple
expectType<string>(t`Hello world`)
expectType<string>(t`Hello ${name}`)

// with labeled expression
expectType<string>(t`Hello ${{ name: user.name }}`)

// with ph labeled expression
expectType<string>(t`Hello ${ph({ name: user.name })}`)

// allow numbers
expectType<string>(t`Hello ${numberValue}`)

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

///
// defineMessage
///

// simple
expectType<MessageDescriptor>(msg`Hello ${name}`)
expectType<MessageDescriptor>(defineMessage`Hello ${name}`)

// with labeled expression
expectType<MessageDescriptor>(msg`Hello ${{ name: user.name }}`)
expectType<MessageDescriptor>(defineMessage`Hello ${{ name: user.name }}`)

// with ph labeled expression
expectType<MessageDescriptor>(msg`Hello ${ph({ name: user.name })}`)
expectType<MessageDescriptor>(defineMessage`Hello ${ph({ name: user.name })}`)

// allow numbers
expectType<MessageDescriptor>(msg`Hello ${numberValue}`)
expectType<MessageDescriptor>(defineMessage`Hello ${numberValue}`)

expectType<MessageDescriptor>(
  defineMessage({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)
expectType<MessageDescriptor>(
  msg({
    id: "custom.id",
    comment: "Hello",
    context: "context",
    message: "Hello world",
  })
)
expectType<MessageDescriptor>(defineMessage`Message`)
expectType<MessageDescriptor>(msg`Message`)

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

// with labeled value
expectType<string>(
  plural(
    { count: 5 },
    {
      one: "...",
      other: "...",
    }
  )
)

// with labeled value with ph helper
expectType<string>(
  plural(ph({ count: 5 }), {
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

// @ts-expect-error: other is required
expectType<string>(plural(5, { one: "test" }))

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

// with labeled value
expectType<string>(
  selectOrdinal(
    { count: 5 },
    {
      one: "...",
      other: "...",
    }
  )
)

// with labeled value with ph helper
expectType<string>(
  selectOrdinal(ph({ count: 5 }), {
    one: "...",
    other: "...",
  })
)

///////////////////
//// Select
///////////////////

type Gender = "male" | "female"
const gender = "male" as Gender // make the type less specific on purpose

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
  // @ts-expect-error: missing required property and other is not supplied
  select(gender, {
    male: "he",
  })
)

expectType<string>(
  // missing required property is okay, if other is supplied as fallback
  select(gender, {
    male: "he",
    other: "they",
  })
)

expectType<string>(
  select(gender, {
    // @ts-expect-error extra properties are not allowed
    incorrect: "",
  })
)

expectType<string>(
  select(gender, {
    // @ts-expect-error extra properties are not allowed even with other fallback
    incorrect: "",
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

// with labeled value
expectType<string>(
  select(
    // @ts-expect-error value could be strings only
    { count: 5 },
    {
      male: "...",
      other: "...",
    }
  )
)

// with labeled value with ph helper
expectType<string>(
  select(ph({ value: "one" }), {
    male: "...",
    other: "...",
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
